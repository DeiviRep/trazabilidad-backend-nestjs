import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Gateway, connect, Identity, Signer, signers, Contract } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FabricService implements OnModuleInit, OnModuleDestroy {
  private gateway: Gateway;
  private contract: Contract | null = null;
  private readonly logger = new Logger(FabricService.name);

  private readonly timeoutMs: number;
  private readonly retryMs: number;
  private readonly maxRetries: number;

  constructor(private configService: ConfigService) {
    this.timeoutMs = this.configService.get<number>('FABRIC_TIMEOUT_MS') || 10000;
    this.retryMs = this.configService.get<number>('FABRIC_RETRY_MS') || 2000;
    this.maxRetries = this.configService.get<number>('FABRIC_MAX_RETRIES') || 2;
  }

  async onModuleInit() {
    await this.connectToFabric();
    // Opcional: arrancar listener aquí si lo quieres (ver comentario más abajo)
    // await this.startEventListener();
  }

  async connectToFabric() {
    const FABRIC_HOST = this.configService.get<string>('FABRIC_HOST') || 'localhost';
    const FABRIC_PORT = this.configService.get<string>('FABRIC_PORT') || '7051';
    const FABRIC_CONFIG_PATH = this.configService.get<string>('FABRIC_CONFIG_PATH');
    const FABRIC_CHANNEL = this.configService.get<string>('FABRIC_CHANNEL') || 'mychannel';
    const CHAINCODE_NAME = this.configService.get<string>('CHAINCODE_NAME') || 'traceability';
    // Rutas relativas: espera que tengas la carpeta fabric-config en la raiz del backend
    const base = FABRIC_CONFIG_PATH || path.resolve(__dirname, '../../fabric-config');

    const clientCertPath = path.join(base, 'User1@org1.example.com-cert.pem');
    const clientKeyPath = path.join(base, 'priv_sk');
    const tlsCertPath = path.join(base, 'ca.crt');
    const mspId = this.configService.get<string>('FABRIC_MSPID') || 'Org1MSP';

    if (!fs.existsSync(clientCertPath) || !fs.existsSync(clientKeyPath) || !fs.existsSync(tlsCertPath)) {
      console.error('No se encontraron las credenciales de Fabric en', base);
      throw new Error(`./fabric-config Credenciales de Fabric faltantes en ${base}`);
    }

    const clientCert = fs.readFileSync(clientCertPath);
    const clientKey = fs.readFileSync(clientKeyPath);
    const tlsCert = fs.readFileSync(tlsCertPath);

    const tlsCredentials = grpc.credentials.createSsl(tlsCert, null, null, {
      checkServerIdentity: () => undefined,
    });

    const endpoint = `${FABRIC_HOST}:${FABRIC_PORT}`;
    const client = new grpc.Client(endpoint, tlsCredentials);

    const identity: Identity = {
      mspId: mspId,
      credentials: clientCert,
    };

    const signer: Signer = signers.newPrivateKeySigner(crypto.createPrivateKey(clientKey));

    try {
      this.gateway = connect({
        client,
        identity,
        signer,
      });

      // Mantener la referencia al contrato para listeners si hace falta
      const network = this.gateway.getNetwork(FABRIC_CHANNEL);
      this.contract = network.getContract(CHAINCODE_NAME);
      this.logger.log(`✅ Conexión a Fabric establecida en ${endpoint}`);
    } catch (error) {
      this.logger.error('❌ Error conectando a Fabric', error);
      throw new Error('No se pudo conectar a la red Fabric');
    }
  }

  private async withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timeout (${this.timeoutMs} ms)`)), this.timeoutMs);
    });
    try {
      const result = await Promise.race([promise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      return result as T;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      throw err;
    }
  }

  private async tryRequest<T>(fn: () => Promise<T>, label: string): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.withTimeout(fn(), label);
      } catch (error) {
        lastErr = error;
        this.logger.warn(`${label} fallo intento ${attempt + 1}/${this.maxRetries + 1}: ${error.message}`);
        await this.connectToFabric();
        if (attempt < this.maxRetries) await new Promise(r => setTimeout(r, this.retryMs));
      }
    }
    throw lastErr;
  }

  async invoke(functionName: string, ...args: string[]): Promise<string> {
    return this.tryRequest(async () => {
      const network = this.gateway.getNetwork(this.configService.get<string>('FABRIC_CHANNEL') || 'mychannel');
      const contract = network.getContract(this.configService.get<string>('CHAINCODE_NAME') || 'traceability');
      const result = await contract.submitTransaction(functionName, ...args);
      return Buffer.from(result).toString('utf8');
    }, `invoke(${functionName})`);
  }

  async query(functionName: string, ...args: string[]): Promise<string> {
    return this.tryRequest(async () => {
      const network = this.gateway.getNetwork(this.configService.get<string>('FABRIC_CHANNEL') || 'mychannel');
      const contract = network.getContract(this.configService.get<string>('CHAINCODE_NAME') || 'traceability');
      const result = await contract.evaluateTransaction(functionName, ...args);
      return Buffer.from(result).toString('utf8');
    }, `query(${functionName})`);
  }

  onModuleDestroy() {
    if (this.gateway) {
      try {
        this.gateway.close();
        this.logger.log('Gateway cerrado');
      } catch (err) {
        this.logger.warn('Error cerrando gateway:', err);
      }
    }
  }

  /**
   * Opcional: listener de eventos Fabric
   * Si lo deseas activar, descomenta la llamada en onModuleInit y adapta la lógica para insertar en Postgres.
   */
  // async startEventListener() {
  //   if (!this.contract) return;
  //   // addContractListener recibe: listenerName, eventName (o null para todos), callback
  //   await this.contract.addContractListener('trazabilidad-listener', '.*', (err, event) => {
  //     if (err) {
  //       console.error('Listener error', err);
  //       return;
  //     }
  //     try {
  //       const payload = event.payload ? event.payload.toString('utf8') : null;
  //       console.log('EVENT >', event.eventName, payload);
  //       // Aquí podrías insertar en Postgres o emitir por websocket
  //     } catch (e) {
  //       console.error('Error processing event', e);
  //     }
  //   });
  // }
}
