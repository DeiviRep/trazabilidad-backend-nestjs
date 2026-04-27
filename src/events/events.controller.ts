import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';  // ← express, no @nestjs/common

@Controller('events')
export class EventsController {
  private static clients = new Map<string, Response[]>();

@Get('subscribe/:productoId')
subscribe(
  @Param('productoId') productoId: string,
  @Req() req: Request,
  @Res() res: Response,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const existing = EventsController.clients.get(productoId) || [];
  existing.push(res);
  EventsController.clients.set(productoId, existing);

  // ← LOG para verificar que el cliente se registró
  console.log(`✅ Cliente SSE conectado: ${productoId} | Total: ${existing.length + 1}`);

  const ping = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(ping);
    const updated = (EventsController.clients.get(productoId) || [])
      .filter(r => r !== res);
    EventsController.clients.set(productoId, updated);
    console.log(`❌ Cliente SSE desconectado: ${productoId} | Restantes: ${updated.length}`);
  });
}

static notify(productoId: string, data: object) {
  const clients = EventsController.clients.get(productoId) || [];
  // ← LOG para verificar que notify se llama
  console.log(`🔔 Notificando: ${productoId} | Clientes: ${clients.length}`);
  const message = `event: update\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try { client.write(message); } catch (e) {
      console.log('Error escribiendo a cliente:', e);
    }
  });
}
}