import { Controller, Get, Post, Body, Param, Res, UseGuards, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TrazabilidadService } from './trazabilidad.service';
import { Response, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { RegistroDto, RegistroLoteDto } from './dto/registro.dto';
import { EmbarqueDto, EmbarqueLoteDto } from './dto/embarque.dto';
import { DesembarqueDto, DesembarqueLoteDto } from './dto/desembarque.dto';
import { NacionalizacionDto, NacionalizacionLoteDto } from './dto/nacionalizacion.dto';
import { DistribucionDto, DistribucionLoteDto } from './dto/distribucion.dto';
import { AdquiridoDto, AdquiridoLoteDto } from './dto/adquirido.dto';

@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(
    private readonly trazabilidadService: TrazabilidadService,
    private readonly configService: ConfigService,
  ) {}

  // ---------- Registro ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('registro')
  @RequirePermissions('registrar_producto')
  @HttpCode(HttpStatus.CREATED)
  async registro(@Req() req: Request, @Body() dto: RegistroDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.registro(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('registro/lote')
  @RequirePermissions('registrar_producto')
  @HttpCode(HttpStatus.CREATED)
  async registroLote(@Req() req: Request, @Body() dto: RegistroLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.registroLote(dto, actor, rol);
  }

  // ---------- Embarque ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('embarque')
  @RequirePermissions('actualizar_embarque')
  async embarque(@Req() req: Request, @Body() dto: EmbarqueDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.embarque(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('embarque/lote')
  @RequirePermissions('actualizar_embarque')
  async embarqueLote(@Req() req: Request, @Body() dto: EmbarqueLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.embarqueLote(dto, actor, rol);
  }

  // ---------- Desembarque ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('desembarque')
  @RequirePermissions('actualizar_desembarque')
  async desembarque(@Req() req: Request, @Body() dto: DesembarqueDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.desembarque(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('desembarque/lote')
  @RequirePermissions('actualizar_desembarque')
  async desembarqueLote(@Req() req: Request, @Body() dto: DesembarqueLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.desembarqueLote(dto, actor, rol);
  }

  // ---------- Nacionalización ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('nacionalizacion')
  @RequirePermissions('nacionalizar')
  async nacionalizacion(@Req() req: Request, @Body() dto: NacionalizacionDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.nacionalizacion(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('nacionalizacion/lote')
  @RequirePermissions('nacionalizar')
  async nacionalizacionLote(@Req() req: Request, @Body() dto: NacionalizacionLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.nacionalizacionLote(dto, actor, rol);
  }

  // ---------- Distribución ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('distribucion')
  @RequirePermissions('gestionar_distribucion')
  async distribucion(@Req() req: Request, @Body() dto: DistribucionDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.distribucion(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('distribucion/lote')
  @RequirePermissions('gestionar_distribucion')
  async distribucionLote(@Req() req: Request, @Body() dto: DistribucionLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.distribucionLote(dto, actor, rol);
  }

  // ---------- Producto Adquirido ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('adquirido')
  @RequirePermissions('producto_adquirido')
  async adquirido(@Req() req: Request, @Body() dto: AdquiridoDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.adquirido(dto, actor, rol);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('adquirido/lote')
  @RequirePermissions('producto_adquirido')
  async adquiridoLote(@Req() req: Request, @Body() dto: AdquiridoLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.adquiridoLote(dto, actor, rol);
  }

  // ---------- Consultas y QR ----------
  @Get('consultar/:id')
  async consultarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.consultarDispositivo(id);
  }

  // Nuevo endpoint para consultar producto (alias del anterior)
  @Get('producto/:id')
  async consultarProducto(@Param('id') id: string) {
    return this.trazabilidadService.consultarProducto(id);
  }

  @Get('buscar')
  async buscar(
    @Query('evento') evento?: string,
    @Query('uuidLote') uuidLote?: string,
    @Query('actor') actor?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('estado') estado?: string,
    @Query('marca') marca?: string,
    @Query('lote') lote?: string,
  ) {
    return this.trazabilidadService.buscar({ 
      evento, 
      uuidLote, 
      actor, 
      fechaInicio, 
      fechaFin, 
      estado, 
      marca, 
      lote 
    });
  }

  // Nuevo endpoint para búsqueda por QR/IMEI
  @Get('buscar-qr/:codigo')
  async buscarPorQR(@Param('codigo') codigo: string) {
    return this.trazabilidadService.buscarPorQR(codigo);
  }

  @Get('historial/:id')
  @RequirePermissions('consultar_historial')
  async obtenerHistorial(@Param('id') id: string) {
    return this.trazabilidadService.obtenerHistorial(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('lote/:uuidLote')
  @RequirePermissions('consultar_historial')
  async listarPorLote(@Param('uuidLote') uuidLote: string) {
    return this.trazabilidadService.listarPorLote(uuidLote);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('listar')
  async listarDispositivos() {
    return this.trazabilidadService.listarDispositivos();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('resumen-lotes')
  async listarResumenLotes() {
    return this.trazabilidadService.listarResumenLotes();
  }
  
  @Get('listar/estadistica')
  async listarPorEstadosDashbord() {
    return this.trazabilidadService.listarPorEstadosDashbord();
  }

  // Nuevo endpoint para estadísticas generales
  @Get('estadisticas')
  async obtenerEstadisticas() {
    return this.trazabilidadService.obtenerEstadisticas();
  }

  // Nuevo endpoint para verificar integridad
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('integridad/:productoId')
  @RequirePermissions('consultar_historial')
  async verificarIntegridad(@Param('productoId') productoId: string) {
    return this.trazabilidadService.verificarIntegridadProducto(productoId);
  }

  // Nuevo endpoint para auditoría completa de lote
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('auditoria/lote/:uuidLote')
  @RequirePermissions('consultar_historial')
  async auditarLote(@Param('uuidLote') uuidLote: string) {
    return this.trazabilidadService.auditarLoteCompleto(uuidLote);
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