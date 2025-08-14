import { Controller, Get, Post, Body, Param, Res, UseGuards, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TrazabilidadService } from './trazabilidad.service';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(
    private readonly trazabilidadService: TrazabilidadService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  async registrarDispositivo(
    @Req() req: Request,
    @Body()
    body: {
      id: string;
      modelo: string;
      marca: string;
      origen: string;
      latitud: string;
      longitud: string;
      evento: string;
      loteId?: string;
      documentos?: any[];
      codigoDocumentos?: object;
      hashDocumentos?: any[];
      urlPublica?: string;
    }
  ) {
    // Extraer actor/rol desde encabezados o token (por ahora headers X-User, X-Role)
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || null;

    const resInvoke = await this.trazabilidadService.registrarDispositivo(
      body.id,
      body.modelo,
      body.marca,
      body.origen,
      body.latitud,
      body.longitud,
      body.evento,
      body.loteId || '',
      actor,
      rol || '',
      body.documentos || [],
      body.codigoDocumentos || {},
      body.hashDocumentos || [],
      body.urlPublica || ''
    );
    return JSON.parse(resInvoke);
  }

  @Get('consultar/:id')
  async consultarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.consultarDispositivo(id);
  }

  @Get('buscar')
  async buscar(
    @Query('evento') evento?: string,
    @Query('loteId') loteId?: string,
    @Query('actor') actor?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.trazabilidadService.buscar({ evento, loteId, actor, fechaInicio, fechaFin });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('actualizar')
  async actualizarDispositivo(
    @Req() req: Request,
    @Body()
    body: {
      id: string;
      modelo?: string;
      marca?: string;
      origen?: string;
      latitud: string;
      longitud: string;
      evento: string;
      documentos?: any[];
      codigoDocumentos?: object;
      hashDocumentos?: any[];
      urlPublica?: string;
      forceUpdate?: boolean;
    }
  ) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || null;

    const resInvoke = await this.trazabilidadService.actualizarDispositivo(
      body.id,
      body.modelo || '',
      body.marca || '',
      body.origen || '',
      body.latitud,
      body.longitud,
      body.evento,
      actor,
      rol,
      body.documentos || [],
      body.codigoDocumentos || {},
      body.hashDocumentos || [],
      body.urlPublica || '',
      !!body.forceUpdate
    );
    return JSON.parse(resInvoke);
  }

  @Get('listar')
  async listarDispositivos() {
    return this.trazabilidadService.listarDispositivos();
  }

  @Get('historial/:id')
  async obtenerHistorial(@Param('id') id: string) {
    return this.trazabilidadService.obtenerHistorial(id);
  }

  @Get('por-lote/:loteId')
  async listarPorLote(@Param('loteId') loteId: string) {
    return this.trazabilidadService.listarPorLote(loteId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('qr/:id')
  async generarQR(@Param('id') id: string) {
    const qrUrl = await this.trazabilidadService.generarQR(id);
    const port = this.configService.get<number>('PORT') || 3000;
    const backendBase = this.configService.get<string>('BACKEND_BASE_URL') || `http://localhost:${port}`;
    return { qrUrl: `${backendBase}${qrUrl}` };
  }

  @Get('qr-image/:id')
  async servirQR(@Param('id') id: string, @Res() res: Response) {
    const qrFilePath = path.join(__dirname, '../../qr-images', `qr-${id}.png`);

    if (!fs.existsSync(qrFilePath)) {
      res.status(404).send('QR no encontrado');
      return;
    }

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${id}.png"`,
    });

    fs.createReadStream(qrFilePath).pipe(res);
  }
}
