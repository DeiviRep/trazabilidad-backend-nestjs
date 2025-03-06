import { Test, TestingModule } from '@nestjs/testing';
import { TrazabilidadService } from './trazabilidad.service';

describe('TrazabilidadService', () => {
  let service: TrazabilidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrazabilidadService],
    }).compile();

    service = module.get<TrazabilidadService>(TrazabilidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
