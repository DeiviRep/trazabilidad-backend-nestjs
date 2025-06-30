# README: Backend - Trazabilidad de Dispositivos

Guía para levantar y probar el backend (`trazabilidad-backend`) basado en NestJS, conectado a Hyperledger Fabric. Expone endpoints REST para interactuar con el chaincode `traceability` en `mychannel`.

---

## **Requisitos**
- **Sistema**: Linux (Ubuntu).  
- **Instalado**:  
  - Node.js/npm: `sudo apt install nodejs npm`  
  - Fabric Network: Levantado en `/home/deivi/TESIS/fabric-samples/test-network` (ver README de Fabric).  
- **Rutas**:  
  - Proyecto: `/home/deivi/TESIS/backend/trazabilidad-backend`  
  - Credenciales: `/home/deivi/TESIS/backend/trazabilidad-backend/fabric-config/`  
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

3. **Configurar .env**:
   ```bash
   echo "
   CORS_ORIGIN_1=https://trazabilidad-frontend-heroui-be37at4ld-deivireps-projects.vercel.app
   CORS_ORIGIN_2=https://trazabilidad-frontend-heroui.vercel.app
   CORS_ORIGIN_3=http://localhost:3001
   FABRIC_HOST=localhost
   FABRIC_PORT=7051
   PORT=3000" > .env
   ```

---

## **Paso 2: Actualizar Credenciales**

El backend usa certificados de Fabric para conectarse a `peer0.org1.example.com` (localhost:7051).

1. **Copiar credenciales**:
```bash
mkdir -p fabric-config
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem fabric-config/User1@org1.example.com-cert.pem
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk fabric-config/priv_sk
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt fabric-config/ca.crt
```

2. **Verificar**:
   ```bash
   ls fabric-config/
   ```
   Deberías ver: `User1@org1.example.com-cert.pem`, `priv_sk`, `ca.crt`.

---

## **Paso 3: Levantar el Backend**

1. **Iniciar el servidor**:
   ```bash
   npm run start:dev
   ```
   Corre en `http://localhost:3000`.

2. **Verificar Fabric**:
   Asegúrate de que la red Fabric esté arriba:
   ```bash
   cd /home/deivi/TESIS/fabric-samples/test-network
   docker ps
   ```

---

## **Paso 4: Probar con curl**

Prueba los endpoints con `curl`. El backend debe estar corriendo.

### Registrar Dispositivo:
```bash
curl -X POST http://localhost:3000/trazabilidad/registrar -H "Content-Type: application/json" -d '{"id":"Cell001","modelo":"Galaxy S23","marca":"Samsung","origen":"Hong Kong","latitud":"-17.6","longitud":"-63.1","evento":"Salida"}'
```
**Salida:**
```json
{"id":"Cell001","modelo":"Galaxy S23","marca":"Samsung","origen":"Hong Kong","ubicacion":"-17.6,-63.1","evento":"Salida","qrCodeId":"TRZ-Cell001-20250402TXXXXXX","timestamp":"2025-04-02TXX:XX:XX.000Z"}
```

### Consultar Dispositivo:
```bash
curl -X GET http://localhost:3000/trazabilidad/consultar/Cell001
```

### Actualizar Dispositivo:
```bash
curl -X POST http://localhost:3000/trazabilidad/actualizar -H "Content-Type: application/json" -d '{"id":"Cell001","modelo":"Galaxy S23","marca":"Samsung","origen":"Hong Kong","latitud":"-16.5","longitud":"-68.1","evento":"Recepción"}'
```

### Obtener Historial:
```bash
curl -X GET http://localhost:3000/trazabilidad/historial/Cell001
```

### Listar Dispositivos:
```bash
curl -X GET http://localhost:3000/trazabilidad/listar
```

---

## **Endpoints Disponibles**

- `POST /trazabilidad/registrar`: Registra un dispositivo (id, modelo, marca, origen, latitud, longitud, evento).
- `GET /trazabilidad/consultar/:id`: Consulta un dispositivo por ID.
- `POST /trazabilidad/actualizar`: Actualiza un dispositivo.
- `GET /trazabilidad/historial/:id`: Obtiene el historial de un dispositivo.
- `GET /trazabilidad/listar`: Lista todos los dispositivos.

---

## **Notas**

- **Credenciales**: Si la red Fabric se regenera, actualiza `fabric-config/` con nuevos certificados.
- **Chaincode**: Usa `traceability` en `mychannel`.
- **Errores**: Si falla, revisa logs del backend (`npm run start:dev`) o verifica Fabric.

---

## **Próximos Pasos**

- **Frontend**: Conectar `/home/deivi/TESIS/frontend/trazabilidad-frontend-heroui` a `http://localhost:3000/trazabilidad`.
- **Pruebas**: Registrar los 20 dispositivos del INE y generar QRs.

