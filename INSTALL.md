---

### **backend/README.md**
```markdown
# Backend - Trazabilidad de Dispositivos

API REST en NestJS conectada a Hyperledger Fabric. Expone endpoints para interactuar con el chaincode `traceability` en el canal `mychannel`.

---

## **Requisitos**
- **Sistema**: Linux (Ubuntu)
- **Instalado**:
  - Node.js y npm  
    ```bash
    sudo apt install nodejs npm
    ```
  - Red Fabric levantada (ver `fabric/README.md`)

---

## **1. Configuración**
```bash
cd /home/deivi/TESIS/backend/trazabilidad-backend
npm install
````

Crear archivo `.env`:

```env
PORT=3000
FABRIC_HOST=localhost
FABRIC_PORT=7051
FABRIC_CHANNEL=mychannel
CHAINCODE_NAME=traceability
FABRIC_MSPID=Org1MSP
FABRIC_CONFIG_PATH=./fabric-config
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=trazabilidad
FRONTEND_BASE_URL=http://localhost:3001
BACKEND_BASE_URL=http://localhost:3000
```

---

## **2. Credenciales de Fabric**

```bash
mkdir -p fabric-config
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/*.pem fabric-config/User1@org1.example.com-cert.pem
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/* fabric-config/priv_sk
cp /home/deivi/TESIS/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt fabric-config/ca.crt
```

---

## **3. Iniciar el servidor**

```bash
npm run start:dev
```

El backend corre en `http://localhost:3000`.

---

## **4. Endpoints principales**

| Método | Ruta                          | Descripción                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/trazabilidad/registrar`     | Registrar nuevo dispositivo    |
| GET    | `/trazabilidad/consultar/:id` | Consultar dispositivo          |
| POST   | `/trazabilidad/actualizar`    | Actualizar información         |
| GET    | `/trazabilidad/historial/:id` | Obtener historial              |
| GET    | `/trazabilidad/listar`        | Listar todos                   |
| GET    | `/trazabilidad/qr/:id`        | Generar QR                     |
| GET    | `/trazabilidad/qr-image/:id`  | Obtener imagen QR              |
| POST   | `/trazabilidad/buscar`        | Buscar por criterios dinámicos |

---

## **5. Pruebas rápidas**

Registrar:

```bash
curl -X POST http://localhost:3000/trazabilidad/registrar \
-H "Content-Type: application/json" \
-d '{"id":"Cell001","modelo":"Galaxy S23","marca":"Samsung","origen":"Hong Kong","latitud":"-17.6","longitud":"-63.1","evento":"Salida"}'
```

Consultar:

```bash
curl http://localhost:3000/trazabilidad/consultar/Cell001
```

---

## **Notas**

* Usa **JWT** en endpoints protegidos (`AuthGuard('jwt')`)
* Auditoría automática en Postgres (`tabla auditoria`)
* Variables de CORS configurables en `.env`

```

---

Si quieres, ahora puedo **unir ambos README en uno solo "Full Stack"** para tu tesis, con backend + fabric + frontend, de forma resumida y listo para anexar en el documento.  
¿Quieres que te lo arme así también?
```
