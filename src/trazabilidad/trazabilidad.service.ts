import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { RegistroDto, RegistroLoteDto } from './dto/registro.dto';
import { EmbarqueDto, EmbarqueLoteDto } from './dto/embarque.dto';
import { DesembarqueDto, DesembarqueLoteDto } from './dto/desembarque.dto';
import { NacionalizacionDto, NacionalizacionLoteDto } from './dto/nacionalizacion.dto';
import { DistribucionDto, DistribucionLoteDto } from './dto/distribucion.dto';
import { AdquiridoDto, AdquiridoLoteDto } from './dto/adquirido.dto';
import { ActualizarCampoEventoDto } from './dto/actualizar-campo-evento.dto';
import { EventsController } from 'src/events/events.controller';

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
    this.FRONTEND =
      this.configService.get<string>('FRONTEND_BASE_URL') || 'http://localhost:3001';
  }

  private readonly estados = {
    REGISTRADO:         'REGISTRADO',
    EMBARCADO:          'EMBARCADO',
    DESEMBARCADO:       'DESEMBARCADO',
    NACIONALIZADO:      'NACIONALIZADO',
    EN_DISTRIBUCION:    'EN_DISTRIBUCION',
    PRODUCTO_ADQUIRIDO: 'PRODUCTO_ADQUIRIDO',
  } as const;

  private buildUrlLote(uuidLote: string) {
    return `${this.FRONTEND}/trazabilidad/lote/${encodeURIComponent(uuidLote)}`;
  }

  // -------------------------------------------------------------------------
  // REGISTRO
  // CAMBIO: se agrega paisOrigen al invoke — ahora el chaincode lo persiste.
  // Firma chaincode: registrarProducto(productoId, lote, uuidLote, marca,
  //                  modelo, imeiSerial, paisOrigen, puntoControl, lat, lon, urlLote)
  // -------------------------------------------------------------------------
  async registro(dto: RegistroDto, actor = '', rol = '') {
    const productoId = dto.id?.trim() || uuidv4();
    const uuidLote   = dto.uuidLote?.trim() || uuidv4();
    const urlLote    = this.buildUrlLote(uuidLote);
    const lote       = `LOTE_${dto.marca}-${dto.modelo}-${Date.now().toString().slice(-6)}`;
    await this.generarQR(productoId);
    const result = await this.fabricService.invoke(
      'registrarProducto',
      productoId,
      lote,
      uuidLote,
      dto.marca,
      dto.modelo,
      dto.imeiSerial,
      dto.paisOrigen,          // NUEVO
      dto.puntoControl,
      dto.latitud,
      dto.longitud,
      urlLote,
    );
    return JSON.parse(result);
  }

  async registroLote(dto: RegistroLoteDto, actor = '', rol = '') {
    const uuidLote = dto.uuidLote?.trim() || uuidv4();
    const urlLote  = this.buildUrlLote(uuidLote);
    const lote     = `LOTE-${Date.now().toString().slice(-6)}`;

    return Promise.all(
      dto.dispositivos.map((d) => {
        const productoId = d.id?.trim() || uuidv4();
        this.generarQR(productoId);
        return this.fabricService
          .invoke(
            'registrarProducto',
            productoId,
            lote,
            uuidLote,
            d.marca,
            d.modelo,
            d.imeiSerial,
            d.paisOrigen,        // NUEVO
            d.puntoControl,
            d.latitud,
            d.longitud,
            urlLote,
          )
          .then(JSON.parse);
        }),
    );
  }

  // -------------------------------------------------------------------------
  // EMBARQUE
  // CAMBIO: se agrega blAwb al datosEvento.
  // -------------------------------------------------------------------------
  async embarque(dto: EmbarqueDto, actor = '', rol = '') {
    const datosEvento = {
      tipoTransporte: dto.tipoTransporte,
      contenedor:     dto.nroContenedor,
      puntoControl:   dto.puntoControl,
      blAwb:          dto.blAwb || '',   // NUEVO
    };

    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.EMBARCADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento),
    );
      const producto = JSON.parse(res);

  // 🔔 Notificar
  EventsController.notify(dto.id, { tipo: 'evento_agregado', producto });

  return producto;
  }

  async embarqueLote(dto: EmbarqueLoteDto, actor = '', rol = '') {
    return Promise.all(
      dto.dispositivos.map((d) => this.embarque(d, actor, rol)),
    );
  }

  // -------------------------------------------------------------------------
  // DESEMBARQUE
  // CAMBIO: se agrega documentoTransito al datosEvento.
  // -------------------------------------------------------------------------
  async desembarque(dto: DesembarqueDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl:          dto.puntoControl,
      integridad:            !!dto.integridad,
      descripcionIntegridad: dto.descripcionIntegridad || '',
      documentoTransito:     dto.documentoTransito || '',  // NUEVO
    };

    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.DESEMBARCADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento),
    );
      const producto = JSON.parse(res);

  // 🔔 Notificar
  EventsController.notify(dto.id, { tipo: 'evento_agregado', producto });

  return producto;
  }

  async desembarqueLote(dto: DesembarqueLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map((d) => this.desembarque(d, actor, rol)));
  }

  // -------------------------------------------------------------------------
  // NACIONALIZACION
  // CAMBIO: se agrega dam al datosEvento.
  // -------------------------------------------------------------------------
  async nacionalizacion(dto: NacionalizacionDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl: dto.puntoControl,
      dim:          dto.dim,
      dam:          dto.dam || '',        // NUEVO
      valorCIF:     dto.valorCIF,
      totalPagado:  dto.totalPagado,
      arancel:      dto.arancel,
      iva:          dto.iva,
      ice:          dto.ice || 0,
    };

    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.NACIONALIZADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento),
    );
      const producto = JSON.parse(res);

  // 🔔 Notificar
  EventsController.notify(dto.id, { tipo: 'evento_agregado', producto });

  return producto;
  }

  async nacionalizacionLote(dto: NacionalizacionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map((d) => this.nacionalizacion(d, actor, rol)));
  }

  // -------------------------------------------------------------------------
  // DISTRIBUCION
  // CAMBIO: se agregan responsable y deposito al datosEvento.
  // -------------------------------------------------------------------------
  async distribucion(dto: DistribucionDto, actor = '', rol = '') {
    const datosEvento = {
      comerciante:  dto.comerciante,
      responsable:  dto.responsable || '',   // NUEVO
      deposito:     dto.deposito    || '',   // antes solo en chaincode, ahora también en service
      puntoControl: dto.puntoControl || '',
    };

    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.EN_DISTRIBUCION,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento),
    );
      const producto = JSON.parse(res);

  // 🔔 Notificar
  EventsController.notify(dto.id, { tipo: 'evento_agregado', producto });

  return producto;
  }

  async distribucionLote(dto: DistribucionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map((d) => this.distribucion(d, actor, rol)));
  }

  // -------------------------------------------------------------------------
  // ADQUIRIDO
  // CAMBIO: se agrega tienda al datosEvento.
  // -------------------------------------------------------------------------
  async adquirido(dto: AdquiridoDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl: dto.puntoControl,
      tienda:       dto.tienda || '',       // NUEVO
      fechaCompra:  dto.fechaCompra || new Date().toISOString(),
      cliente:      actor,
    };

    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.PRODUCTO_ADQUIRIDO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento),
    );
      const producto = JSON.parse(res);

  // 🔔 Notificar
  EventsController.notify(dto.id, { tipo: 'evento_agregado', producto });

  return producto;
  }

  async adquiridoLote(dto: AdquiridoLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map((d) => this.adquirido(d, actor, rol)));
  }

  // -------------------------------------------------------------------------
  // CONSULTAS (sin cambios)
  // -------------------------------------------------------------------------
  async consultarProducto(id: string) {
    const result = await this.fabricService.query('obtenerProducto', id);
    return JSON.parse(result);
  }

  async consultarDispositivo(id: string) {
    return this.consultarProducto(id);
  }

  async listarDispositivos() {
    const result = await this.fabricService.query('listarProductos');
    return JSON.parse(result);
  }

  async obtenerHistorial(id: string) {
    const result = await this.fabricService.query('auditarHistorialProducto', id);
    return JSON.parse(result);
  }

  async listarPorLote(uuidLote: string) {
    const result = await this.fabricService.query('listarProductosPorLote', uuidLote);
    return JSON.parse(result);
  }

  async buscar(params: {
    evento?:      string;
    uuidLote?:    string;
    actor?:       string;
    fechaInicio?: string;
    fechaFin?:    string;
    estado?:      string;
    marca?:       string;
    lote?:        string;
  }) {
    const result  = await this.fabricService.query('listarProductos');
    let productos = JSON.parse(result);

    const { estado, marca, lote, uuidLote, fechaInicio, fechaFin } = params;

    if (estado && estado !== 'TODOS') {
      productos = productos.filter((p: any) => p.estado === estado);
    }
    if (marca) {
      const q = marca.toLowerCase();
      productos = productos.filter((p: any) =>
        p.marca?.toLowerCase().includes(q) ||
        p.modelo?.toLowerCase().includes(q) ||
        p.imeiSerial?.toLowerCase().includes(q),
      );
    }
    if (lote) {
      const q = lote.toLowerCase();
      productos = productos.filter((p: any) =>
        p.lote?.toLowerCase().includes(q) ||
        p.uuidLote?.toLowerCase().includes(q),
      );
    }
    if (uuidLote) {
      productos = productos.filter((p: any) => p.uuidLote === uuidLote);
    }

    const start = fechaInicio ? new Date(fechaInicio).getTime() : null;
    const end   = fechaFin    ? new Date(fechaFin).getTime()    : null;
    if (start || end) {
      productos = productos.filter((p: any) => {
        const t = p.fechaCreacion ? new Date(p.fechaCreacion).getTime() : null;
        return t && (!start || t >= start) && (!end || t <= end);
      });
    }

    return productos;
  }

  async listarDispositivosRecientes(limite: string | null) {
    const result = await this.fabricService.query('obtenerActividadReciente', limite || '5');
    return JSON.parse(result);
  }

  async listarResumenLotes() {
    const result = await this.fabricService.query('listarResumenLotes');
    return JSON.parse(result);
  }

  async listarPorEstadosDashbord() {
    const estadisticas        = await this.fabricService.query('obtenerEstadisticas');
    const dispositivosRecientes = await this.listarDispositivosRecientes('5');
    return {
      dispositivosRecientes,
      estadisticas: JSON.parse(estadisticas),
    };
  }

  async obtenerEstadisticas() {
    const result = await this.fabricService.query('obtenerEstadisticas');
    return JSON.parse(result);
  }

  async buscarPorQR(codigo: string) {
    const result = await this.fabricService.query('buscarPorQR', codigo);
    return JSON.parse(result);
  }

  async verificarIntegridadProducto(productoId: string) {
    const result = await this.fabricService.query('verificarIntegridadProducto', productoId);
    return JSON.parse(result);
  }

  async auditarLoteCompleto(uuidLote: string) {
    const result = await this.fabricService.query('auditarLoteCompleto', uuidLote);
    return JSON.parse(result);
  }

  // -------------------------------------------------------------------------
  // QR
  // -------------------------------------------------------------------------
  async generarQR(id: string): Promise<string> {
    const frontendUrl = `${this.FRONTEND}/trazabilidad/historial/${encodeURIComponent(id)}`;
    const qrFilePath  = path.join(this.qrDir, `qr-${id}.png`);
    await QRCode.toFile(qrFilePath, frontendUrl, {
      type: 'png',
      width: 300,
      errorCorrectionLevel: 'H',
    });
    return `/trazabilidad/qr-image/${id}`;
  }

  async obtenerQRBase64(id: string): Promise<string> {
    const qrFilePath = path.join(this.qrDir, `qr-${id}.png`);
    if (!fs.existsSync(qrFilePath)) {
      throw new Error(`QR no encontrado para el ID ${id}`);
    }
    const fileBuffer = fs.readFileSync(qrFilePath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }

async actualizarCampoEvento(dto, actor, rol) {
  const result = await this.fabricService.invoke(
    'actualizarCampoEvento',
    dto.productoId,
    String(dto.indexEvento),
    JSON.stringify(dto.campos),
  );
  const producto = JSON.parse(result);

  // 🔔 Notificar a clientes conectados
  EventsController.notify(dto.productoId, { tipo: 'campo_actualizado', producto });

  return producto;
}
}