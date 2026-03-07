import { Test, TestingModule } from '@nestjs/testing';
import { SalesLeadController } from './sales_lead.controller';

describe('SalesLeadController', () => {
  let controller: SalesLeadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesLeadController],
    }).compile();

    controller = module.get<SalesLeadController>(SalesLeadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
