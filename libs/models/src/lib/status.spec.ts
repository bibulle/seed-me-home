import { Test } from '@nestjs/testing';

describe('model status', () => {
  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: []
    }).compile();
  });

  describe('no test on interface', () => {
    it('Always OK"', () => {
      expect(true).toEqual(true);
    });
  });
});
