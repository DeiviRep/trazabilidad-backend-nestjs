import { Test, TestingModule } from '@nestjs/testing';
import { TrazabilidadController } from './trazabilidad.controller';

describe('TrazabilidadController', () => {
  let controller: TrazabilidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrazabilidadController],
    }).compile();

    controller = module.get<TrazabilidadController>(TrazabilidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
