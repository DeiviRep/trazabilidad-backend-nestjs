import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

// DTOs
import { RegistroDto, RegistroLoteDto } from './dto/registro.dto';
import { EmbarqueDto, EmbarqueLoteDto } from './dto/embarque.dto';
import { DesembarqueDto, DesembarqueLoteDto } from './dto/desembarque.dto';
import { NacionalizacionDto, NacionalizacionLoteDto } from './dto/nacionalizacion.dto';
import { DistribucionDto, DistribucionLoteDto } from './dto/distribucion.dto';
import { AdquiridoDto, AdquiridoLoteDto } from './dto/adquirido.dto';

@Injectable()
export class TrazabilidadService {
  private readonly qrDir = path.join(__dirname, '../../qr-images');
  private readonly FRONTEND: string;

  constructor(
    private readonly fabricService: FabricService,
    private readonly configService: ConfigService,
  ) {
    if (!fs.existsSync(this.qrDir)) {
      fs.mkdirSync(this.qrDir, { recursive: true });
    }
    this.FRONTEND = this.configService.get<string>('FRONTEND_BASE_URL') || 'http://localhost:3001';
  }

  // ---------- Helpers ----------
  private eventos = {
    REGISTRO: 'Registro',
    EMBARQUE: 'Embarque',
    DESEMBARQUE: 'Desembarque',
    NACIONALIZACION: 'Nacionalización',
    DISTRIBUCION: 'Distribución',
    ADQUIRIDO: 'ConsumidorFinal',
  } as const;

  private buildUrlLote(uuidLote: string) {
    return `${this.FRONTEND}/trazabilidad/lote/${encodeURIComponent(uuidLote)}`;
  }

  // ---------- Registro ----------
  async registro(dto: RegistroDto, actor = '', rol = '') {
    const deviceId = dto.id && dto.id.trim().length > 0 ? dto.id : uuidv4();
    const uuidLote = dto.uuidLote && dto.uuidLote.trim().length > 0 ? dto.uuidLote : uuidv4();
    const urlLote = this.buildUrlLote(uuidLote);

    const documentosMetaJSON = JSON.stringify(dto.documentosMeta || []);
    const documentosCodigoJSON = JSON.stringify(dto.documentosCodigo || {});
    const documentosHashJSON = JSON.stringify(dto.documentosHash || []);

    const result = await this.fabricService.invoke(
      'registrarDispositivo',
      deviceId,
      dto.modelo,
      dto.marca,
      dto.imeiSerial,
      dto.origenPais,
      dto.latitud,
      dto.longitud,
      this.eventos.REGISTRO,
      uuidLote,
      actor,
      rol || '',
      urlLote,              // <= importante
      JSON.stringify({}),   // detalles libres (no requeridos en registro)
      documentosMetaJSON,
      documentosCodigoJSON,
      documentosHashJSON,
    );
    return JSON.parse(result);
  }

  async registroLote(dto: RegistroLoteDto, actor = '', rol = '') {
    const uuidLote = dto.uuidLote;
    const urlLote = this.buildUrlLote(uuidLote);
    return Promise.all(
      dto.dispositivos.map((d) =>
        this.fabricService.invoke(
          'registrarDispositivo',
          d.id && d.id.trim().length > 0 ? d.id : uuidv4(),
          d.modelo,
          d.marca,
          d.imeiSerial,
          d.origenPais,
          d.latitud,
          d.longitud,
          this.eventos.REGISTRO,
          uuidLote,
          actor,
          rol || '',
          urlLote,
          JSON.stringify({}),
          JSON.stringify(d.documentosMeta || []),
          JSON.stringify(d.documentosCodigo || {}),
          JSON.stringify(d.documentosHash || []),
        ).then(JSON.parse)
      )
    );
  }

  // ---------- Embarque ----------
  async embarque(dto: EmbarqueDto, actor = '', rol = '') {
    const detalles = {
      tipoTransporte: dto.tipoTransporte,
      nroContenedor: dto.nroContenedor || '',
      puertoSalida: dto.puertoSalida,
    };
    const res = await this.fabricService.invoke(
      'actualizarDispositivo',
      dto.id,
      '', '', '',                            // modelo, marca, origenPais ignorados
      dto.latitud,
      dto.longitud,
      this.eventos.EMBARQUE,
      actor,
      rol || '',
      JSON.stringify(dto.documentosMeta || []),
      JSON.stringify(dto.documentosCodigo || {}),
      JSON.stringify(dto.documentosHash || []),
      'false',
      JSON.stringify(detalles),
    );
    return JSON.parse(res);
  }

  async embarqueLote(dto: EmbarqueLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.embarque(d, actor, rol)));
  }

  // ---------- Desembarque ----------
  async desembarque(dto: DesembarqueDto, actor = '', rol = '') {
    const detalles = {
      puertoExtranjero: dto.puertoExtranjero,
      integridad: !!dto.integridad,
      descripcionIntegridad: dto.descripcionIntegridad || '',
    };
    const res = await this.fabricService.invoke(
      'actualizarDispositivo',
      dto.id,
      '', '', '',
      dto.latitud,
      dto.longitud,
      this.eventos.DESEMBARQUE,
      actor,
      rol || '',
      JSON.stringify(dto.documentosMeta || []),
      JSON.stringify(dto.documentosCodigo || {}),
      JSON.stringify(dto.documentosHash || []),
      'false',
      JSON.stringify(detalles),
    );
    return JSON.parse(res);
  }

  async desembarqueLote(dto: DesembarqueLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.desembarque(d, actor, rol)));
  }

  // ---------- Nacionalización ----------
  async nacionalizacion(dto: NacionalizacionDto, actor = '', rol = '') {
    const detalles = {
      dim: dto.dim,
      valorCif: dto.valorCif,
      arancel: dto.arancel,
      iva: dto.iva,
      ice: dto.ice || 0,
      totalPagado: dto.totalPagado,
    };
    const res = await this.fabricService.invoke(
      'actualizarDispositivo',
      dto.id,
      '', '', '',
      dto.latitud,
      dto.longitud,
      this.eventos.NACIONALIZACION,
      actor,
      rol || '',
      JSON.stringify(dto.documentosMeta || []),
      JSON.stringify(dto.documentosCodigo || {}),
      JSON.stringify(dto.documentosHash || []),
      'false',
      JSON.stringify(detalles),
    );
    return JSON.parse(res);
  }

  async nacionalizacionLote(dto: NacionalizacionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.nacionalizacion(d, actor, rol)));
  }

  // ---------- Distribución ----------
  async distribucion(dto: DistribucionDto, actor = '', rol = '') {
    const detalles = {
      comerciante: dto.comerciante,
      deposito: dto.deposito || '',
    };
    const res = await this.fabricService.invoke(
      'actualizarDispositivo',
      dto.id,
      '', '', '',
      dto.latitud,
      dto.longitud,
      this.eventos.DISTRIBUCION,
      actor,
      rol || '',
      JSON.stringify(dto.documentosMeta || []),
      JSON.stringify(dto.documentosCodigo || {}),
      JSON.stringify(dto.documentosHash || []),
      'false',
      JSON.stringify(detalles),
    );
    return JSON.parse(res);
  }

  async distribucionLote(dto: DistribucionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.distribucion(d, actor, rol)));
  }

  // ---------- Producto Adquirido ----------
  async adquirido(dto: AdquiridoDto, actor = '', rol = '') {
    const detalles = {
      tienda: dto.tienda,
      fechaCompra: dto.fechaCompra,
    };
    const res = await this.fabricService.invoke(
      'actualizarDispositivo',
      dto.id,
      '', '', '',
      dto.latitud,
      dto.longitud,
      this.eventos.ADQUIRIDO,
      actor,
      rol || '',
      JSON.stringify(dto.documentosMeta || []),
      JSON.stringify(dto.documentosCodigo || {}),
      JSON.stringify(dto.documentosHash || []),
      'false',
      JSON.stringify(detalles),
    );
    return JSON.parse(res);
  }

  async adquiridoLote(dto: AdquiridoLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.adquirido(d, actor, rol)));
  }

  // ---------- Consultas ----------
  async consultarDispositivo(id: string) {
    const result = await this.fabricService.query('consultarDispositivo', id);
    return JSON.parse(result);
  }

  async listarDispositivos() {
    const result = await this.fabricService.query('listarDispositivos');
    return JSON.parse(result);
  }

  async obtenerHistorial(id: string) {
    const result = await this.fabricService.query('obtenerHistorial', id);
    return JSON.parse(result);
  }

  async listarPorLote(uuidLote: string) {
    const result = await this.fabricService.query('listarPorLote', uuidLote);
    return JSON.parse(result);
  }

  async buscar(params: { evento?: string; uuidLote?: string; actor?: string; fechaInicio?: string; fechaFin?: string; }) {
    const dispositivos = await this.listarDispositivos();
    const start = params.fechaInicio ? new Date(params.fechaInicio).getTime() : null;
    const end = params.fechaFin ? new Date(params.fechaFin).getTime() : null;
    return dispositivos.filter((d: any) => {
      const okEvento = params.evento ? d.evento === params.evento : true;
      const okLote = params.uuidLote ? d.uuidLote === params.uuidLote : true;
      const okActor = params.actor ? d.actor === params.actor : true;
      const okFecha = (start || end) ? (() => {
        const t = d.timestamp ? new Date(d.timestamp).getTime() : null;
        return t && (!start || t >= start) && (!end || t <= end);
      })() : true;
      return okEvento && okLote && okActor && okFecha;
    });
  }

  // ---------- QR (no tocar lógica) ----------
  async generarQR(id: string): Promise<string> {
    const historial = await this.obtenerHistorial(id);
    if (!historial || historial.length === 0) {
      throw new Error(`No se encontró historial para el dispositivo ${id}`);
    }

    const frontendUrl = `${this.FRONTEND}/trazabilidad/historial/${encodeURIComponent(id)}`;
    const qrFilePath = path.join(this.qrDir, `qr-${id}.png`);
    await QRCode.toFile(qrFilePath, frontendUrl, {
      type: 'png',
      width: 300,
      errorCorrectionLevel: 'H',
    });
    return `/trazabilidad/qr-image/${id}`;
  }
}
