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

  // ---------- Estados del nuevo contrato ----------
  private estados = {
    REGISTRADO: 'REGISTRADO',
    EMBARCADO: 'EMBARCADO',
    DESEMBARCADO: 'DESEMBARCADO',
    NACIONALIZADO: 'NACIONALIZADO',
    EN_DISTRIBUCION: 'EN_DISTRIBUCION',
    PRODUCTO_ADQUIRIDO: 'PRODUCTO_ADQUIRIDO'
  } as const;

  private buildUrlLote(uuidLote: string) {
    return `${this.FRONTEND}/trazabilidad/lote/${encodeURIComponent(uuidLote)}`;
  }

  // ---------- Registro ----------
  async registro(dto: RegistroDto, actor = '', rol = '') {
    const productoId = dto.id && dto.id.trim().length > 0 ? dto.id : uuidv4();
    const uuidLote = dto.uuidLote && dto.uuidLote.trim().length > 0 ? dto.uuidLote : uuidv4();
    const urlLote = this.buildUrlLote(uuidLote);

    // Crear lote placeholder (número secuencial o basado en marca/modelo)
    const lote = `LOTE_${dto.marca}-${dto.modelo}-${Date.now().toString().slice(-6)}`;

    const result = await this.fabricService.invoke(
      'registrarProducto',
      productoId,
      lote,
      uuidLote,
      dto.marca,
      dto.modelo,
      dto.imeiSerial,
      dto.puntoControl,
      dto.latitud,
      dto.longitud,
      urlLote
    );
    return JSON.parse(result);
  }

  async registroLote(dto: RegistroLoteDto, actor = '', rol = '') {
    const uuidLote = dto.uuidLote && dto.uuidLote.trim().length > 0 ? dto.uuidLote : uuidv4();
    const urlLote = this.buildUrlLote(uuidLote);
    const lote = `LOTE-${Date.now().toString().slice(-6)}`;
    return Promise.all(
      dto.dispositivos.map((d) => {
        const productoId = d.id && d.id.trim().length > 0 ? d.id : uuidv4();
        
        return this.fabricService.invoke(
          'registrarProducto',
          productoId,
          lote,
          uuidLote,
          d.marca,
          d.modelo,
          d.imeiSerial,
          d.puntoControl,
          d.latitud,
          d.longitud,
          urlLote
        ).then(JSON.parse);
      })
    );
  }

  // ---------- Embarque ----------
  async embarque(dto: EmbarqueDto, actor = '', rol = '') {
    const datosEvento = {
      tipoTransporte: dto.tipoTransporte,
      contenedor: dto.nroContenedor,
      puntoControl: dto.puntoControl,
    };
    
    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.EMBARCADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento)
    );
    return JSON.parse(res);
  }

  async embarqueLote(dto: EmbarqueLoteDto, actor = '', rol = '') {
    const datosEvento = {
      tipoTransporte: dto.dispositivos[0]?.tipoTransporte || '',
      contenedor: dto.dispositivos[0]?.nroContenedor || '',
      puntoControl: dto.dispositivos[0]?.puntoControl || ''
    };

    // Usar evento masivo si todos los dispositivos tienen el mismo lote
    const primerDispositivo = dto.dispositivos[0];
    if (primerDispositivo && dto.dispositivos.length > 1) {
      try {
        const producto = await this.consultarProducto(primerDispositivo.id);
        const uuidLote = producto.uuidLote;
        
        const res = await this.fabricService.invoke(
          'agregarEventoLoteMasivo',
          uuidLote,
          this.estados.EMBARCADO,
          `${actor} - ${rol}`,
          primerDispositivo.latitud,
          primerDispositivo.longitud,
          JSON.stringify(datosEvento)
        );
        return JSON.parse(res);
      } catch (error) {
        // Si falla el evento masivo, procesar individualmente
      }
    }

    return Promise.all(dto.dispositivos.map(dispositivo => this.embarque(dispositivo, actor, rol)));
  }

  // ---------- Desembarque ----------
  async desembarque(dto: DesembarqueDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl: dto.puntoControl,
      integridad: !!dto.integridad,
      descripcionIntegridad: dto.descripcionIntegridad || ''
    };
    
    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.DESEMBARCADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento)
    );
    return JSON.parse(res);
  }

  async desembarqueLote(dto: DesembarqueLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.desembarque(d, actor, rol)));
  }

  // ---------- Nacionalización ----------
  async nacionalizacion(dto: NacionalizacionDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl: dto.puntoControl,
      dim: dto.dim,
      valorCIF: dto.valorCIF,
      totalPagado: dto.totalPagado,
      arancel: dto.arancel,
      iva: dto.iva,
      ice: dto.ice || 0,
    };
    
    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.NACIONALIZADO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento)
    );
    return JSON.parse(res);
  }

  async nacionalizacionLote(dto: NacionalizacionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.nacionalizacion(d, actor, rol)));
  }

  // ---------- Distribución ----------
  async distribucion(dto: DistribucionDto, actor = '', rol = '') {
    const datosEvento = {
      comerciante: dto.comerciante,
      puntoControl: dto.puntoControl || ''
    };
    
    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.EN_DISTRIBUCION,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento)
    );
    return JSON.parse(res);
  }

  async distribucionLote(dto: DistribucionLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.distribucion(d, actor, rol)));
  }

  // ---------- Producto Adquirido ----------
  async adquirido(dto: AdquiridoDto, actor = '', rol = '') {
    const datosEvento = {
      puntoControl: dto.puntoControl,
      fechaCompra: dto.fechaCompra,
      cliente: actor
    };
    
    const res = await this.fabricService.invoke(
      'agregarEventoProducto',
      dto.id,
      this.estados.PRODUCTO_ADQUIRIDO,
      `${actor} - ${rol}`,
      dto.latitud,
      dto.longitud,
      JSON.stringify(datosEvento)
    );
    return JSON.parse(res);
  }

  async adquiridoLote(dto: AdquiridoLoteDto, actor = '', rol = '') {
    return Promise.all(dto.dispositivos.map(d => this.adquirido(d, actor, rol)));
  }

  // ---------- Consultas ----------
  async consultarProducto(id: string) {
    const result = await this.fabricService.query('obtenerProducto', id);
    return JSON.parse(result);
  }

  async consultarDispositivo(id: string) {
    // Mantener compatibilidad con el método anterior
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
    evento?: string; 
    uuidLote?: string; 
    actor?: string; 
    fechaInicio?: string; 
    fechaFin?: string; 
    estado?: string;
    marca?: string;
    lote?: string;
  }) {
    // Usar el nuevo método de filtros del contrato
    const result = await this.fabricService.query(
      'listarProductosConFiltro',
      params.estado || '',
      params.marca || '',
      params.lote || ''
    );
    
    let productos = JSON.parse(result);
    
    // Aplicar filtros adicionales en el backend si es necesario
    const start = params.fechaInicio ? new Date(params.fechaInicio).getTime() : null;
    const end = params.fechaFin ? new Date(params.fechaFin).getTime() : null;
    
    return productos.filter((producto: any) => {
      const okLote = params.uuidLote ? producto.uuidLote === params.uuidLote : true;
      const okFecha = (start || end) ? (() => {
        const fechaCreacion = producto.fechaCreacion ? new Date(producto.fechaCreacion).getTime() : null;
        return fechaCreacion && (!start || fechaCreacion >= start) && (!end || fechaCreacion <= end);
      })() : true;
      
      return okLote && okFecha;
    });
  }

  async listarDispositivosRecientes(limite:string | null) {
    const result = await this.fabricService.query('obtenerActividadReciente', limite || '5');
    return JSON.parse(result);
  }

  async listarResumenLotes() {
    const result = await this.fabricService.query('listarResumenLotes');
    return JSON.parse(result);
  }

  async listarPorEstadosDashbord() {
    const estadisticas = await this.fabricService.query('obtenerEstadisticas');
    const stats = JSON.parse(estadisticas);
    const dispositivosRecientes = await this.listarDispositivosRecientes('5');
    
    // // Obtener productos por estado usando filtros
    // const registrados = await this.fabricService.query('listarProductosConFiltro', this.estados.REGISTRADO, '', '');
    // const embarcados = await this.fabricService.query('listarProductosConFiltro', this.estados.EMBARCADO, '', '');
    // const nacionalizados = await this.fabricService.query('listarProductosConFiltro', this.estados.NACIONALIZADO, '', '');
    // const distribuidos = await this.fabricService.query('listarProductosConFiltro', this.estados.EN_DISTRIBUCION, '', '');
    return {
      // registrados: JSON.parse(registrados),
      // distribuidos: JSON.parse(distribuidos),
      // enTransitos: JSON.parse(embarcados),
      // nacionalizados: JSON.parse(nacionalizados),
      dispositivosRecientes: dispositivosRecientes,
      estadisticas: stats
    };
  }

  // ---------- Nuevos métodos del contrato ----------
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

  // ---------- QR (actualizado para usar nuevos métodos) ----------
  async generarQR(id: string): Promise<string> {
    // const historial = await this.obtenerHistorial(id);
    // if (!historial || historial.length === 0) {
    //   throw new Error(`No se encontró historial para el producto ${id}`);
    // }

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