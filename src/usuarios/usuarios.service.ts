import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AssignRolDto } from './dto/assign-rol.dto';

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  async onModuleInit() {
    // Seed roles si no existen
    const base = ['Proveedor', 'Transportista', 'Aduana', 'Importador', 'ConsumidorFinal'];
    for (const nombre of base) {
      const found = await this.rolRepo.findOne({ where: { nombre } });
      if (!found) {
        await this.rolRepo.save(this.rolRepo.create({ nombre }));
      }
    }
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
    return this.usuarioRepo.find();
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({ where: { email } });
  }

  async assignRol(id: number, dto: AssignRolDto): Promise<Usuario> {
    const user = await this.usuarioRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const rol = await this.rolRepo.findOne({ where: { nombre: dto.rolNombre } });
    if (!rol) throw new BadRequestException('Rol no válido');

    user.rol = rol;
    return this.usuarioRepo.save(user);
  }
}
