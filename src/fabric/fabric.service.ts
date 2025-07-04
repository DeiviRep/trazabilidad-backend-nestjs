import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Gateway, connect, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class FabricService implements OnModuleDestroy {
  private gateway: Gateway;

  constructor() {
    this.connectToFabric();
  }

  async connectToFabric() {
    // Host y puerto de variables de entorno
    const FABRIC_HOST = process.env.FABRIC_HOST || 'localhost';
    const FABRIC_PORT = process.env.FABRIC_PORT || '7051';

    const clientCert = fs.readFileSync(path.join(__dirname, '../../fabric-config/User1@org1.example.com-cert.pem'));
    const clientKey = fs.readFileSync(path.join(__dirname, '../../fabric-config/priv_sk'));
    const tlsCert = fs.readFileSync(path.join(__dirname, '../../fabric-config/ca.crt'));

    const tlsCredentials = grpc.credentials.createSsl(tlsCert, null, null, {
      checkServerIdentity: () => undefined, // Ignora validación hostname
    });

    const endpoint = `${FABRIC_HOST}:${FABRIC_PORT}`;
    const client = new grpc.Client(endpoint, tlsCredentials);

    const identity: Identity = {
      mspId: 'Org1MSP',
      credentials: clientCert,
    };

    const signer: Signer = signers.newPrivateKeySigner(crypto.createPrivateKey(clientKey));

    try {
      this.gateway = connect({
        client,
        identity,
        signer,
      });
      console.log(`✅ Conexión a Fabric establecida en ${endpoint}`);
    } catch (error) {
      console.error('❌ Error conectando a Fabric:', error);
      throw new Error('No se pudo conectar a la red Fabric');
    }
  }

  async invoke(functionName: string, ...args: string[]): Promise<string> {
    try {
      const network = this.gateway.getNetwork('mychannel');
      const contract = network.getContract('traceability');
      const result = await contract.submitTransaction(functionName, ...args);
      const resultString = Buffer.from(result).toString('utf8');
      console.log('Invoke result:', resultString);
      return resultString;
    } catch (error) {
      console.error(`Error en invoke (${functionName}):`, error);
      throw new Error(`Fallo al ejecutar ${functionName}: ${error.message}`);
    }
  }

  async query(functionName: string, ...args: string[]): Promise<string> {
    try {
      const network = this.gateway.getNetwork('mychannel');
      const contract = network.getContract('traceability');
      const result = await contract.evaluateTransaction(functionName, ...args);
      const resultString = Buffer.from(result).toString('utf8');
      console.log('Query result:', resultString);
      return resultString;
    } catch (error) {
      console.error(`Error en query (${functionName}):`, error);
      throw new Error(`Fallo al consultar ${functionName}: ${error.message}`);
    }
  }

  onModuleDestroy() {
    if (this.gateway) {
      this.gateway.close();
      console.log('Gateway cerrado');
    }
  }
}
