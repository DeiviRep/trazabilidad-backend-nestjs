import { HttpException, HttpStatus } from '@nestjs/common';

export class FabricException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}