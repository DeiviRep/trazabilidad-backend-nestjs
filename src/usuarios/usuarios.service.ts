import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AssignRolDto } from './dto/assign-rol.dto';

const PERMISOS_ROL = {
  PROVEEDOR: ["registrar_producto"],
  IMPORTADOR: ["gestionar_distribucion", "consultar_historial","registrar_producto"],
  TRANSPORTISTA: ["actualizar_embarque", "actualizar_desembarque"],
  ADUANA_EXTRANJERA: ["actualizar_desembarque"],
  ADUANA_BOLIVIA: ["nacionalizar"],
  COMERCIANTE: ["gestionar_distribucion","producto_adquirido"],
  CONSUMIDOR: ["consultar_qr"],
  ADMIN: [
    "registrar_producto",
    "actualizar_embarque",
    "actualizar_desembarque",
    "nacionalizar",
    "gestionar_distribucion",
    "producto_adquirido",
    "consultar_historial",
    "gestionar_usuarios",
  ],
}

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  async onModuleInit() {
    // Seed roles si no existen
    const rolesBase = [
      { nombre: "PROVEEDOR", descripcion: "Registra productos y genera documentación inicial" },
      { nombre: "IMPORTADOR", descripcion: "Gestiona proceso completo de importación" },
      { nombre: "TRANSPORTISTA", descripcion: "Maneja embarque y transporte" },
      { nombre: "ADUANA_EXTRANJERA", descripcion: "Controla desembarque en puertos internacionales" },
      { nombre: "ADUANA_BOLIVIA", descripcion: "Nacionalización y control aduanero final" },
      { nombre: "COMERCIANTE", descripcion: "Distribución y venta" },
      { nombre: "CONSUMIDOR", descripcion: "Verificación y compra final" },
      { nombre: "ADMIN", descripcion: "Administración completa del sistema" },
    ]
    for (const rolData of rolesBase) {
      const found = await this.rolRepo.findOne({ where: { nombre: rolData.nombre } })
      if (!found) {
        await this.rolRepo.save(this.rolRepo.create(rolData))
      }
    }
  }

  async validarPermisoRol(rolNombre: string, accion: string): Promise<boolean> {
    return PERMISOS_ROL[rolNombre]?.includes(accion) || false
  }

  async obtenerPermisosUsuario(usuarioId: number): Promise<string[]> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId },
      relations: ["rol"],
    })

    if (!usuario || !usuario.rol) {
      return []
    }
    return PERMISOS_ROL[usuario.rol.nombre] || []
  }

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existing = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email ya registrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);

    let rol: Rol | null = null;
    if (dto.rolNombre) {
      rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
      if (!rol) throw new BadRequestException('Rol no válido');
    }

    const user = this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol: rol || null,
    });
    return this.usuarioRepo.save(user);
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find({ relations: ["rol"] })
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email:email },
      relations: ["rol"],
    })
  }

  async assignRol(id: number, dto: AssignRolDto): Promise<Usuario> {
    const user = await this.usuarioRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
    if (!rol) throw new BadRequestException('Rol no válido');

    user.rol = rol;
    return this.usuarioRepo.save(user);
  }

  async validarTransicionEstado(rolNombre: string, estadoActual: string, nuevoEstado: string): Promise<boolean> {
    const transicionesValidas = {
      REGISTRADO: ["EMBARCADO"],
      EMBARCADO: ["DESEMBARCADO"],
      DESEMBARCADO: ["NACIONALIZADO"],
      NACIONALIZADO: ["EN_DISTRIBUCION"],
      EN_DISTRIBUCION: ["PRODUCTO_ADQUIRIDO"],
    }

    if (estadoActual && !transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
      return false
    }

    const transicionesPorRol = {
      PROVEEDOR: ["REGISTRADO"],
      TRANSPORTISTA: ["EMBARCADO", "DESEMBARCADO"],
      ADUANA_EXTRANJERA: ["DESEMBARCADO"],
      ADUANA_BOLIVIA: ["NACIONALIZADO"],
      IMPORTADOR: ["EN_DISTRIBUCION"],
      COMERCIANTE: ["EN_DISTRIBUCION", "PRODUCTO_ADQUIRIDO"],
      ADMIN: ["REGISTRADO", "EMBARCADO", "DESEMBARCADO", "NACIONALIZADO", "EN_DISTRIBUCION", "PRODUCTO_ADQUIRIDO"],
    }

    return transicionesPorRol[rolNombre]?.includes(nuevoEstado) || false
  }
}
