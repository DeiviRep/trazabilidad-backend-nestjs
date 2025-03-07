import { Injectable } from '@nestjs/common';
import { Gateway, connect, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class FabricService {
  private gateway: Gateway;

  constructor() {
    this.connectToFabric();
  }

  async connectToFabric() {
    const clientCert = fs.readFileSync(path.join(__dirname, '../../fabric-config/User1@org1.example.com-cert.pem'));
    const clientKey = fs.readFileSync(path.join(__dirname, '../../fabric-config/priv_sk'));
    const tlsCert = fs.readFileSync(path.join(__dirname, '../../fabric-config/ca.crt'));

    const tlsCredentials = grpc.credentials.createSsl(tlsCert);
    const client = new grpc.Client('localhost:7051', tlsCredentials);

    const identity: Identity = {
      mspId: 'Org1MSP',
      credentials: clientCert,
    };

    const signer: Signer = signers.newPrivateKeySigner(crypto.createPrivateKey(clientKey));

    this.gateway = connect({
      client,
      identity,
      signer,
    });
  }

  async invoke(functionName: string, ...args: string[]): Promise<string> {
    const network = this.gateway.getNetwork('mychannel');
    const contract = network.getContract('trazabilidad');
    const result = await contract.submitTransaction(functionName, ...args);
    const resultString = Buffer.from(result).toString('utf8'); // Convertir Buffer explícitamente
    console.log('Invoke result:', resultString); // Depuración
    return resultString;
  }

  async query(functionName: string, ...args: string[]): Promise<string> {
    const network = this.gateway.getNetwork('mychannel');
    const contract = network.getContract('trazabilidad');
    const result = await contract.evaluateTransaction(functionName, ...args);
    const resultString = Buffer.from(result).toString('utf8'); // Convertir Buffer explícitamente
    console.log('Query result:', resultString); // Depuración
    return resultString;
  }
}