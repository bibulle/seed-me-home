import { Test, TestingModule } from '@nestjs/testing';

import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedServiceMock, RtorrentMock, RtorrentServiceTestValues } from './rtorrent.service.spec';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';

describe('Rtorrent Controller', () => {
  let module: TestingModule;
  let controller: RtorrentController;
  let service: RtorrentService;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [RtorrentController],
      providers: [RtorrentService, ConfigService, { provide: FtpSeedService, useClass: FtpSeedServiceMock }]
    }).compile();
    controller = module.get<RtorrentController>(RtorrentController);
    service = module.get<RtorrentService>(RtorrentService);
    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('status should be ok', async () => {
    service.forceRtorrentForMocking(new RtorrentMock());
    expect(await controller.getStatus()).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_STATUS);
  });

  it('status should be ko', async () => {
    expect.assertions(2);

    const rtorrentMock = new RtorrentMock();
    rtorrentMock.getAllError = true;
    service.forceRtorrentForMocking(rtorrentMock);
    controller.getStatus().catch(err => {
      expect(err).not.toBeNull();
      expect(err.faultCode).toEqual(-1);
      //done();
    });
  });

  it('torrents should be ok', async () => {
    service.forceRtorrentForMocking(new RtorrentMock());
    expect(await controller.getTorrents()).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);

    // try to pause
    const result1 = [];
    RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
      const t1 = { ...t };
      result1.push(t1);
      if (t.hash === RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash) {
        t1.active = false;
      }
    });
    expect(await controller.pauseTorrent(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash)).toEqual(result1);

    // start, it should go back to normal
    expect(await controller.startTorrent(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash)).toEqual(
      RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS
    );

    // remove, it should be removed
    const result2 = [];
    RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
      const t1 = { ...t };
      if (t.hash !== RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash) {
        result2.push(t1);
      }
    });
    expect(await controller.removeTorrent(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash)).toEqual(result2);

    // should download should switch
    service.forceRtorrentForMocking(new RtorrentMock());
    expect(await controller.getTorrents()).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);
    const result3 = [];
    RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
      const t1 = { ...t };
      result3.push(t1);
      if (t.hash === RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash) {
        t1.shouldDownload = true;
        t1.files.forEach(f => {
          f.shouldDownload = true;
        });
      }
    });
    expect(await controller.shouldDownload(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS[0].hash, 'true')).toEqual(
      result3
    );
  });
});
