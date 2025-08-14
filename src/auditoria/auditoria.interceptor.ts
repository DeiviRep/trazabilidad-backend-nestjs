import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './auditoria.entity';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const usuario = req.user?.nombre || 'desconocido';
    const accion = `${req.method} ${req.url}`;
    const entidad = req.baseUrl.replace(/^\//, '') || 'desconocido';
    const detalle = req.body || {};

    return next.handle().pipe(
      tap(async () => {
        await this.auditoriaRepo.save({
          usuario,
          accion,
          entidad,
          detalle,
        });
      }),
    );
  }
}
