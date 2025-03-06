import { Injectable } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';

@Injectable()
export class TrazabilidadService {
  constructor(private readonly fabricService: FabricService) {}

  async registrarDispositivo(id: string, modelo: string, marca: string, caracteristica: string, origen: string) {
    return this.fabricService.invoke('registrarDispositivo', id, modelo, marca, caracteristica, origen);
  }

  async consultarDispositivo(id: string) {
    return this.fabricService.query('consultarDispositivo', id);
  }

  async actualizarDispositivo(id: string, modelo: string, marca: string, caracteristica: string, origen: string) {
    return this.fabricService.invoke('actualizarDispositivo', id, modelo, marca, caracteristica, origen);
  }

  async eliminarDispositivo(id: string) {
    return this.fabricService.invoke('eliminarDispositivo', id);
  }

  async listarDispositivos() {
    return this.fabricService.query('listarDispositivos');
  }

  async consultarPorMarca(marca: string) {
    return this.fabricService.query('consultarPorMarca', marca);
  }

  async consultarPorOrigen(origen: string) {
    return this.fabricService.query('consultarPorOrigen', origen);
  }

  async obtenerHistorial(id: string) {
    return this.fabricService.query('obtenerHistorial', id);
  }

  async consultarPorRangoDeTiempo(id: string, startDate: string, endDate: string) {
    return this.fabricService.query('consultarPorRangoDeTiempo', id, startDate, endDate);
  }

  async contarPorMarca() {
    return this.fabricService.query('contarPorMarca');
  }

  async exportarHistorialCompleto() {
    return this.fabricService.query('exportarHistorialCompleto');
  }
}