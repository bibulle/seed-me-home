import { VersionService } from './version.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [VersionService]
    }).compile();

    service = module.get<VersionService>(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
