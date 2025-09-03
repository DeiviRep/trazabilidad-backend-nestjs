import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UsuariosService } from "../../usuarios/usuarios.service"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>("permissions", context.getHandler())
    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException("Usuario no autenticado")
    }

    const userPermissions = await this.usuariosService.obtenerPermisosUsuario(user.id)

    const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission))

    if (!hasPermission) {
      throw new ForbiddenException("No tiene permisos suficientes para esta acción")
    }

    return true
  }
}
