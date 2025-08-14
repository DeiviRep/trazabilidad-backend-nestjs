import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = { sub: user.id, email: user.email, nombre: user.nombre, rol: user.rol?.nombre || null };
    const token = await this.jwtService.signAsync(payload);
    return { user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol?.nombre || null }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, nombre: user.nombre, rol: user.rol?.nombre || null };
    const token = await this.jwtService.signAsync(payload);
    return { user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol?.nombre || null }, token };
  }
}
