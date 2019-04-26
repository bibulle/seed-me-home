import { Test, TestingModule } from '@nestjs/testing';

import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedServiceMock, RtorrentServiceTestValues } from './rtorrent.service.spec';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';

describe('Rtorrent Controller', () => {
  let module: TestingModule;
  let controller: RtorrentController;
  let service: RtorrentService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [RtorrentController],
      providers: [RtorrentService, ConfigService, { provide: FtpSeedService, useClass: FtpSeedServiceMock }]
    }).compile();
    controller = module.get<RtorrentController>(RtorrentController);
    service = module.get<RtorrentService>(RtorrentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('status should be ok', async () => {
    service.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    expect(await controller.getStatus()).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_STATUS);
  });

  it('status should be ko', async done => {
    service.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT_ERR);
    controller.getStatus().catch(err => {
      expect(err).not.toBeNull();
      expect(err.faultCode).toEqual(-1);
      done();
    });
  });

  it('torrents should be ok', async () => {
    service.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    expect(await controller.getTorrents()).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);
  });
});
