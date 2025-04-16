import { Controller, Get, Post, Body, Param, Res, UseInterceptors } from '@nestjs/common';
import { TrazabilidadService } from './trazabilidad.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  @Post('registrar')
  async registrarDispositivo(
    @Body() body: { id: string; modelo: string; marca: string; origen: string; latitud: string; longitud: string; evento: string }
  ) {
    const result = await this.trazabilidadService.registrarDispositivo(
      body.id,
      body.modelo,
      body.marca,
      body.origen,
      body.latitud,
      body.longitud,
      body.evento
    );
    return JSON.parse(result);
  }

  @Get('consultar/:id')
  async consultarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.consultarDispositivo(id);
  }

  @Post('actualizar')
  async actualizarDispositivo(
    @Body() body: { id: string; modelo: string; marca: string; origen: string; latitud: string; longitud: string; evento: string }
  ) {
    const result = await this.trazabilidadService.actualizarDispositivo(
      body.id,
      body.modelo,
      body.marca,
      body.origen,
      body.latitud,
      body.longitud,
      body.evento
    );
    return JSON.parse(result);
  }

  @Get('listar')
  async listarDispositivos() {
    return this.trazabilidadService.listarDispositivos();
  }

  @Get('historial/:id')
  async obtenerHistorial(@Param('id') id: string) {
    return this.trazabilidadService.obtenerHistorial(id);
  }

  @Get('qr/:id')
  async generarQR(@Param('id') id: string) {
    const qrUrl = await this.trazabilidadService.generarQR(id);
    return { qrUrl: `http://localhost:3000${qrUrl}` }; // URL completa
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