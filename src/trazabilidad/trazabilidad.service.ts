import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TrazabilidadService {
  private readonly qrDir = path.join(__dirname, '../../qr-images'); // Directorio para guardar QRs

  constructor(private readonly fabricService: FabricService) {
    // Crear el directorio si no existe
    if (!fs.existsSync(this.qrDir)) {
      fs.mkdirSync(this.qrDir, { recursive: true });
    }
  }

  async registrarDispositivo(id: string, modelo: string, marca: string, origen: string, latitud: string, longitud: string, evento: string) {
    return this.fabricService.invoke('registrarDispositivo', id, modelo, marca, origen, latitud, longitud, evento);
  }

  async consultarDispositivo(id: string) {
    const result = await this.fabricService.query('consultarDispositivo', id);
    return JSON.parse(result);
  }

  async actualizarDispositivo(id: string, modelo: string, marca: string, origen: string, latitud: string, longitud: string, evento: string) {
    return this.fabricService.invoke('actualizarDispositivo', id, modelo, marca, origen, latitud, longitud, evento);
  }

  async listarDispositivos() {
    const result = await this.fabricService.query('listarDispositivos');
    return JSON.parse(result);
  }

  async obtenerHistorial(id: string) {
    const result = await this.fabricService.query('obtenerHistorial', id);
    return JSON.parse(result);
  }

  async generarQR(id: string): Promise<string> {
    // Obtener el historial del dispositivo
    const historial = await this.obtenerHistorial(id);
    if (!historial || historial.length === 0) {
      throw new Error(`No se encontró historial para el dispositivo ${id}`);
    }

    // URL que se codificará en el QR
    const frontendUrl = `http://localhost:3001/trazabilidad/historial/${id}`; // Ajusta según tu frontend

    // Ruta donde se guardará el QR
    const qrFilePath = path.join(this.qrDir, `qr-${id}.png`);

    // Generar el QR y guardarlo en disco
    await QRCode.toFile(qrFilePath, frontendUrl, {
      type: 'png',
      width: 300,
      errorCorrectionLevel: 'H',
    });

    // Devolver la URL para acceder al QR
    return `/trazabilidad/qr-image/${id}`;
  }
}