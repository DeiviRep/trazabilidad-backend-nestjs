import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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

  constructor(private configService: ConfigService) {}

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
      throw new Error('Credenciales de Fabric faltantes. Verifica FABRIC_CONFIG_PATH o coloca los archivos en fabric-config/');
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

      console.log(`✅ Conexión a Fabric establecida en ${endpoint}`);
    } catch (error) {
      console.error('❌ Error conectando a Fabric:', error);
      throw new Error('No se pudo conectar a la red Fabric');
    }
  }

  async invoke(functionName: string, ...args: string[]): Promise<string> {
    if (!this.gateway) throw new Error('Gateway no inicializado');
    try {
      const network = this.gateway.getNetwork(this.configService.get<string>('FABRIC_CHANNEL') || 'mychannel');
      const contract = network.getContract(this.configService.get<string>('CHAINCODE_NAME') || 'traceability');
      const result = await contract.submitTransaction(functionName, ...args);
      return Buffer.from(result).toString('utf8');
    } catch (error) {
      console.error(`Error en invoke (${functionName}):`, error);
      throw new Error(`Fallo al ejecutar ${functionName}: ${error.message}`);
    }
  }

  async query(functionName: string, ...args: string[]): Promise<string> {
    if (!this.gateway) throw new Error('Gateway no inicializado');
    try {
      const network = this.gateway.getNetwork(this.configService.get<string>('FABRIC_CHANNEL') || 'mychannel');
      const contract = network.getContract(this.configService.get<string>('CHAINCODE_NAME') || 'traceability');
      const result = await contract.evaluateTransaction(functionName, ...args);
      return Buffer.from(result).toString('utf8');
    } catch (error) {
      console.error(`Error en query (${functionName}):`, error);
      throw new Error(`Fallo al consultar ${functionName}: ${error.message}`);
    }
  }

  onModuleDestroy() {
    if (this.gateway) {
      try {
        this.gateway.close();
        console.log('Gateway cerrado');
      } catch (err) {
        console.warn('Error cerrando gateway:', err);
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
