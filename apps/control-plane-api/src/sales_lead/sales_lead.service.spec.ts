import { Test, TestingModule } from '@nestjs/testing';
import { SalesLeadService } from './sales_lead.service';

describe('SalesLeadService', () => {
  let service: SalesLeadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesLeadService],
    }).compile();

    service = module.get<SalesLeadService>(SalesLeadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
