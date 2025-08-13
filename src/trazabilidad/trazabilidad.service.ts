import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TrazabilidadService {
  private readonly qrDir = path.join(__dirname, '../../qr-images');

  constructor(private readonly fabricService: FabricService) {
    if (!fs.existsSync(this.qrDir)) {
      fs.mkdirSync(this.qrDir, { recursive: true });
    }
  }

  // registrarDispositivo con parámetros opcionales
  async registrarDispositivo(
    id: string | null,
    modelo: string,
    marca: string,
    origen: string,
    latitud: string,
    longitud: string,
    evento: string,
    loteId = '',
    actor = '',
    rol = '',
    documentos: any[] = [],
    codigoDocumentos: object = {},
    hashDocumentos: any[] = [],
    urlPublica = ''
  ) {
    const documentosJSON = JSON.stringify(documentos || []);
    const codigoDocumentosJSON = JSON.stringify(codigoDocumentos || {});
    const hashDocumentosJSON = JSON.stringify(hashDocumentos || []);
    const deviceId = id && id.trim().length > 0 ? id : uuidv4();
    return this.fabricService.invoke(
      'registrarDispositivo',
      deviceId,
      modelo,
      marca,
      origen,
      latitud,
      longitud,
      evento,
      loteId,
      actor,
      rol,
      documentosJSON,
      codigoDocumentosJSON,
      hashDocumentosJSON,
      urlPublica
    );
  }

  async consultarDispositivo(id: string) {
    const result = await this.fabricService.query('consultarDispositivo', id);
    return JSON.parse(result);
  }

  async actualizarDispositivo(
    id: string,
    modelo: string,
    marca: string,
    origen: string,
    latitud: string,
    longitud: string,
    evento: string,
    actor = '',
    rol = '',
    documentos: any[] = [],
    codigoDocumentos: object = {},
    hashDocumentos: any[] = [],
    urlPublica = '',
    forceUpdate = false
  ) {
    const documentosJSON = JSON.stringify(documentos || []);
    const codigoDocumentosJSON = JSON.stringify(codigoDocumentos || {});
    const hashDocumentosJSON = JSON.stringify(hashDocumentos || []);
    return await this.fabricService.invoke(
      'actualizarDispositivo',
      id,
      modelo,
      marca,
      origen,
      latitud,
      longitud,
      evento,
      actor,
      rol,
      documentosJSON,
      codigoDocumentosJSON,
      hashDocumentosJSON,
      urlPublica,
      forceUpdate ? 'true' : 'false'
    );
  }

  async listarDispositivos() {
    const result = await this.fabricService.query('listarDispositivos');
    return JSON.parse(result);
  }

  async obtenerHistorial(id: string) {
    const result = await this.fabricService.query('obtenerHistorial', id);
    return JSON.parse(result);
  }

  async listarPorLote(loteId: string) {
    const result = await this.fabricService.query('listarPorLote', loteId);
    return JSON.parse(result);
  }

  // Generar QR: ahora incluirá URL que el frontend pueda resolver
  async generarQR(id: string): Promise<string> {
    // Obtener el historial del dispositivo para asegurar existencia
    const historial = await this.obtenerHistorial(id);
    if (!historial || historial.length === 0) {
      throw new Error(`No se encontró historial para el dispositivo ${id}`);
    }

    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
    const frontendUrl = `${frontendBase}/trazabilidad/historial/${encodeURIComponent(id)}`;

    const qrFilePath = path.join(this.qrDir, `qr-${id}.png`);
    await QRCode.toFile(qrFilePath, frontendUrl, {
      type: 'png',
      width: 300,
      errorCorrectionLevel: 'H',
    });

    // Devuelve la ruta relativa servida por el backend (ServeStatic)
    return `/trazabilidad/qr-image/${id}`;
  }
}
