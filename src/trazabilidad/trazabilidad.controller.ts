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
@UseGuards(AuthGuard('jwt'),RolesGuard)
export class TrazabilidadController {
  constructor(
    private readonly trazabilidadService: TrazabilidadService,
    private readonly configService: ConfigService,
  ) {}

  // ---------- Registro ----------
  @Post('registro')
  @RequirePermissions('registrar_producto')
  @HttpCode(HttpStatus.CREATED)
  async registro(@Req() req: Request, @Body() dto: RegistroDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.registro(dto, actor, rol);
  }

  @Post('registro/lote')
  @RequirePermissions('registrar_producto')
  @HttpCode(HttpStatus.CREATED)
  async registroLote(@Req() req: Request, @Body() dto: RegistroLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.registroLote(dto, actor, rol);
  }

  // ---------- Embarque ----------
  @Post('embarque')
  @RequirePermissions('actualizar_embarque')
  async embarque(@Req() req: Request, @Body() dto: EmbarqueDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.embarque(dto, actor, rol);
  }

  @Post('embarque/lote')
  @RequirePermissions('actualizar_embarque')
  async embarqueLote(@Req() req: Request, @Body() dto: EmbarqueLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.embarqueLote(dto, actor, rol);
  }

  // ---------- Desembarque ----------
  @Post('desembarque')
  @RequirePermissions('actualizar_desembarque')
  async desembarque(@Req() req: Request, @Body() dto: DesembarqueDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.desembarque(dto, actor, rol);
  }

  @Post('desembarque/lote')
  @RequirePermissions('actualizar_desembarque')
  async desembarqueLote(@Req() req: Request, @Body() dto: DesembarqueLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.desembarqueLote(dto, actor, rol);
  }

  // ---------- Nacionalización ----------
  @Post('nacionalizacion')
  @RequirePermissions('nacionalizar')
  async nacionalizacion(@Req() req: Request, @Body() dto: NacionalizacionDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.nacionalizacion(dto, actor, rol);
  }

  @Post('nacionalizacion/lote')
  @RequirePermissions('nacionalizar')
  async nacionalizacionLote(@Req() req: Request, @Body() dto: NacionalizacionLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.nacionalizacionLote(dto, actor, rol);
  }

  // ---------- Distribución ----------
  @Post('distribucion')
  @RequirePermissions('gestionar_distribucion')
  async distribucion(@Req() req: Request, @Body() dto: DistribucionDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.distribucion(dto, actor, rol);
  }

  @Post('distribucion/lote')
  @RequirePermissions('gestionar_distribucion')
  async distribucionLote(@Req() req: Request, @Body() dto: DistribucionLoteDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.distribucionLote(dto, actor, rol);
  }

  // ---------- Producto Adquirido ----------
  @Post('adquirido')
  @RequirePermissions('gestionar_distribucion') // o un permiso específico si defines "producto_adquirido"
  async adquirido(@Req() req: Request, @Body() dto: AdquiridoDto) {
    const actor = (req as any).user?.nombre || 'desconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.adquirido(dto, actor, rol);
  }

  @Post('adquirido/lote')
  @RequirePermissions('gestionar_distribucion')
  async adquiridoLote(@Req() req: Request, @Body() dto: AdquiridoLoteDto) {
    const actor = (req as any).user?.nombre || 'desconconocido';
    const rol = (req as any).user?.rol || '';
    return this.trazabilidadService.adquiridoLote(dto, actor, rol);
  }

  // ---------- Consultas y QR ----------
  @Get('consultar/:id')
  async consultarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.consultarDispositivo(id);
  }

  @Get('buscar')
  async buscar(
    @Query('evento') evento?: string,
    @Query('uuidLote') uuidLote?: string,
    @Query('actor') actor?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.trazabilidadService.buscar({ evento, uuidLote, actor, fechaInicio, fechaFin });
  }

  @Get('historial/:id')
  @RequirePermissions('consultar_historial')
  async obtenerHistorial(@Param('id') id: string) {
    return this.trazabilidadService.obtenerHistorial(id);
  }

  @Get('lote/:uuidLote')
  @RequirePermissions('consultar_historial')
  async listarPorLote(@Param('uuidLote') uuidLote: string) {
    return this.trazabilidadService.listarPorLote(uuidLote);
  }

  @Get('listar')
  async listarDispositivos() {
    return this.trazabilidadService.listarDispositivos();
  }

  // @UseGuards(AuthGuard('jwt'))
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
