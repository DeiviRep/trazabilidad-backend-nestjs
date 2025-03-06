import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TrazabilidadService } from './trazabilidad.service';

@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  @Post('registrar')
  async registrarDispositivo(@Body() body: { id: string, modelo: string, marca: string, caracteristica: string, origen: string }) {
    return this.trazabilidadService.registrarDispositivo(body.id, body.modelo, body.marca, body.caracteristica, body.origen);
  }

  @Get('consultar/:id')
  async consultarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.consultarDispositivo(id);
  }

  @Post('actualizar')
  async actualizarDispositivo(@Body() body: { id: string, modelo: string, marca: string, caracteristica: string, origen: string }) {
    return this.trazabilidadService.actualizarDispositivo(body.id, body.modelo, body.marca, body.caracteristica, body.origen);
  }

  @Post('eliminar/:id')
  async eliminarDispositivo(@Param('id') id: string) {
    return this.trazabilidadService.eliminarDispositivo(id);
  }

  @Get('listar')
  async listarDispositivos() {
    return this.trazabilidadService.listarDispositivos();
  }

  @Get('marca/:marca')
  async consultarPorMarca(@Param('marca') marca: string) {
    return this.trazabilidadService.consultarPorMarca(marca);
  }

  @Get('origen/:origen')
  async consultarPorOrigen(@Param('origen') origen: string) {
    return this.trazabilidadService.consultarPorOrigen(origen);
  }

  @Get('historial/:id')
  async obtenerHistorial(@Param('id') id: string) {
    return this.trazabilidadService.obtenerHistorial(id);
  }

  @Get('rango/:id/:start/:end')
  async consultarPorRangoDeTiempo(@Param('id') id: string, @Param('start') start: string, @Param('end') end: string) {
    return this.trazabilidadService.consultarPorRangoDeTiempo(id, start, end);
  }

  @Get('contar')
  async contarPorMarca() {
    return this.trazabilidadService.contarPorMarca();
  }

  @Get('exportar')
  async exportarHistorialCompleto() {
    return this.trazabilidadService.exportarHistorialCompleto();
  }
}