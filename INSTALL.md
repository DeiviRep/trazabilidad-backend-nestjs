¡Genial, David! Me alegra que hayas probado todo y que funcione perfectamente. Ahora vamos a crear un **README.md** para el backend (`/home/deivi/TESIS/backend/trazabilidad-backend/`) similar al que hicimos para Fabric: una guía práctica y directa para levantarlo, configurarlo y probarlo desde cero, como referencia para nosotros. Lo armaré detallado con los pasos que seguimos, incluyendo las credenciales, el ajuste del chaincode y las pruebas con `curl`.

---

# README: Backend - Trazabilidad de Dispositivos

Guía para levantar y probar el backend de trazabilidad (`trazabilidad-backend`) basado en NestJS, conectado a Hyperledger Fabric. Este proyecto expone endpoints REST para interactuar con el chaincode `traceability` en `mychannel`.

---

## **Requisitos**
- **Sistema**: Linux (Ubuntu).  
- **Instalado**:  
  - Node.js/npm: `sudo apt install nodejs npm`  
  - Fabric Network: Levantado en `/home/deivi/TESIS/fabric-samples/test-network` (ver README de Fabric).  
- **Rutas**:  
  - Proyecto: `/home/deivi/TESIS/backend/trazabilidad-backend`  
  - Credenciales: `fabric-config/` (en la raíz del proyecto).  
  - Fabric: `/home/deivi/TESIS/fabric-samples/test-network`

---

## **Paso 1: Configurar el Proyecto**

1. **Ir al directorio**:
   ```bash
   cd /home/deivi/TESIS/backend/trazabilidad-backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar `.env`**:
   ```bash
   echo "IS_PROD=false
CORS_ORIGIN_1=https://trazabilidad-frontend-heroui-be37at4ld-deivireps-projects.vercel.app
CORS_ORIGIN_2=https://trazabilidad-frontend-heroui.vercel.app
CORS_ORIGIN_3=http://localhost:3001
PORT=3000" > .env
   ```

---

## **Paso 2: Actualizar Credenciales**

El backend usa certificados de Fabric para conectarse a `peer0.org1.example.com` (localhost:7051). Estos están en `fabric-config/`.

1. **Copiar credenciales desde Fabric**:
   ```bash
   cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem fabric-config/User1@org1.example.com-cert.pem
   cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk fabric-config/priv_sk
   cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt fabric-config/ca.crt
   ```

2. **Verificar**:
   ```bash
   ls fabric-config/
   ```
   - Deberías ver: `User1@org1.example.com-cert.pem`, `priv_sk`, `ca.crt`.

---

## **Paso 3: Ajustar `FabricService`**

El chaincode en Fabric se llama `traceability`, y las credenciales están en `fabric-config/` (raíz).

1. **Editar `src/fabric/fabric.service.ts`**:
   ```typescript
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
       const PORT_LOCAL = 'localhost:7051';
       const PORT_PROD = '0.tcp.sa.ngrok.io:15418';
       const IS_PROD = process.env.IS_PROD === 'true';
       const FABRIC_HOST = IS_PROD ? PORT_PROD : PORT_LOCAL;
       const clientCert = fs.readFileSync(path.join(__dirname, '../../../fabric-config/User1@org1.example.com-cert.pem'));
       const clientKey = fs.readFileSync(path.join(__dirname, '../../../fabric-config/priv_sk'));
       const tlsCert = fs.readFileSync(path.join(__dirname, '../../../fabric-config/ca.crt'));

       const tlsCredentials = grpc.credentials.createSsl(tlsCert, null, null, {
         checkServerIdentity: () => undefined,
       });
       const client = new grpc.Client(FABRIC_HOST, tlsCredentials);

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
       const contract = network.getContract('traceability');
       const result = await contract.submitTransaction(functionName, ...args);
       const resultString = Buffer.from(result).toString('utf8');
       console.log('Invoke result:', resultString);
       return resultString;
     }

     async query(functionName: string, ...args: string[]): Promise<string> {
       const network = this.gateway.getNetwork('mychannel');
       const contract = network.getContract('traceability');
       const result = await contract.evaluateTransaction(functionName, ...args);
       const resultString = Buffer.from(result).toString('utf8');
       console.log('Query result:', resultString);
       return resultString;
     }
   }
   ```

2. **Guardar el archivo**.

---

## **Paso 4: Levantar el Backend**

1. **Iniciar el servidor**:
   ```bash
   npm run start:dev
   ```
   - Corre en `http://localhost:3000`. Si hay errores, revisa el log.

2. **Verificar Fabric**:
   - Asegúrate de que la red Fabric esté arriba:
     ```bash
     cd /home/deivi/TESIS/fabric-samples/test-network
     docker ps
     ```
     - Deberías ver `peer0.org1.example.com`, `peer0.org2.example.com`, y `orderer.example.com`.

---

## **Paso 5: Probar con `curl`**

Prueba los endpoints desde la terminal con `curl`. El backend debe estar corriendo.

1. **Registrar Dispositivo**:
   ```bash
   curl -X POST http://localhost:3000/trazabilidad/registrar -H "Content-Type: application/json" -d '{"id":"cell003","modelo":"Teléfono móvil","marca":"Genérica","caracteristica":"369 kg","origen":"Hong Kong"}'
   ```

2. **Consultar Dispositivo**:
   ```bash
   curl -X GET http://localhost:3000/trazabilidad/consultar/cell003
   ```

3. **Actualizar Dispositivo**:
   ```bash
   curl -X POST http://localhost:3000/trazabilidad/actualizar -H "Content-Type: application/json" -d '{"id":"cell003","modelo":"Teléfono móvil","marca":"Genérica","caracteristica":"Aeropuerto Viru-Viru","origen":"Hong Kong"}'
   ```

4. **Obtener Historial**:
   ```bash
   curl -X GET http://localhost:3000/trazabilidad/historial/cell003
   ```

5. **Listar Dispositivos**:
   ```bash
   curl -X GET http://localhost:3000/trazabilidad/listar
   ```

---

## **Endpoints Disponibles**
- **POST `/trazabilidad/registrar`**: Registra un dispositivo (id, modelo, marca, caracteristica, origen).  
- **GET `/trazabilidad/consultar/:id`**: Consulta un dispositivo por ID.  
- **POST `/trazabilidad/actualizar`**: Actualiza un dispositivo.  
- **GET `/trazabilidad/historial/:id`**: Obtiene el historial de un dispositivo.  
- **GET `/trazabilidad/listar`**: Lista todos los dispositivos.  
- Otros: `eliminar`, `consultarPorMarca`, `consultarPorOrigen`, etc. (no probados aún).

---

## **Notas**
- **Credenciales**: Si la red Fabric se regenera, actualiza `fabric-config/` con los nuevos certificados.  
- **Chaincode**: Usa `traceability` (no `trazabilidad`), como está desplegado en Fabric.  
- **Errores**: Si falla, revisa logs del backend (`npm run start:dev`) o verifica que Fabric esté corriendo.

---

## **Próximos Pasos**
- **Frontend**: Conectar `/home/deivi/TESIS/frontend/trazabilidad-frontend-heroui` a `http://localhost:3000/trazabilidad`.  
- **Mejorar Chaincode**: Agregar `latitud`, `longitud` o `addEvent` si se necesita (redeplegar con `-ccv 2.0`).

---

¡Listo! Podés guardar esto como `README.md` en `/home/deivi/TESIS/backend/trazabilidad-backend/`. Es una guía clara para levantar y probar el backend desde cero.

### **¿Qué Seguimos?**
- **Frontend**: ¿Levantamos el frontend ahora y lo conectamos?  
- **Ajustes**: ¿Querés probar más endpoints o mejorar algo en el backend/chaincode?  
- **Feedback**: ¿Te parece bien el README o querés agregar algo?

¡Dame tu OK y seguimos avanzando! Esto ya está sólido.
