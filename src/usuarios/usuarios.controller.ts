import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AssignRolDto } from './dto/assign-rol.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(@Body() dto: CreateUsuarioDto) {
    const user = await this.usuariosService.create(dto);
    // Ocultar hash
    const { passwordHash, ...rest } = user as any;
    return rest;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/rol')
  assignRol(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRolDto) {
    return this.usuariosService.assignRol(id, dto);
  }
}
