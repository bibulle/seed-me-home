import { Test, TestingModule } from '@nestjs/testing';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';
import * as _ from 'lodash';
import { FtpSeedService, Progression } from '../ftp-seed/ftp-seed.service';
import { RtorrentTorrent } from '@seed-me-home/models';

export class RtorrentServiceTestValues {
  //noinspection SpellCheckingInspection
  static readonly FAKE_RTORRENT_RETURN = {
    up_rate: '191',
    down_rate: '28',
    up_total: '1293694778894',
    down_total: '463360286085',
    bind: '0.0.0.0',
    check_hash: '0',
    dht_port: '6881',
    directory: '/home/14user/rutorrent/torrents',
    download_rate: '104857600',
    http_cacert: '',
    http_capath: '',
    http_proxy: '',
    ip: '0.0.0.0',
    max_downloads_div: '1',
    max_downloads_global: '0',
    max_file_size: '137438953472',
    max_memory_usage: '3435973836',
    max_open_files: '256',
    max_open_http: '32',
    max_peers: '100',
    max_peers_seed: '50',
    max_uploads: '15',
    max_uploads_global: '0',
    min_peers_seed: '10',
    min_peers: '40',
    peer_exchange: '0',
    port_open: '1',
    upload_rate: '25600000',
    port_random: '0',
    port_range: '45000-65000',
    preload_min_size: '262144',
    preload_required_rate: '5120',
    preload_type: '0',
    proxy_address: '0.0.0.0',
    receive_buffer_size: '0',
    safe_sync: '0',
    scgi_dont_route: '0',
    send_buffer_size: '0',
    session: '/home/14user/.session/',
    session_lock: '1',
    session_on_completion: '1',
    split_file_size: '-1',
    split_suffix: '.part',
    timeout_safe_sync: '900',
    timeout_sync: '600',
    tracker_numwant: '-1',
    use_udp_trackers: '1',
    max_uploads_div: '1',
    max_open_sockets: '65024',
    free_disk_space: 24319991808,
    torrents: [
      {
        hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
        torrent: '',
        torrentsession: '',
        path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
        name: 'ubuntu-18.10-desktop-amd64.iso',
        size: 1999503360,
        skip: 0,
        completed: 1155399680,
        down_rate: 19944210,
        down_total: 1196652654,
        up_rate: 0,
        up_total: 0,
        message: '',
        bitfield:
          'FEFF9FFFFFFE3FE100000000000000000000000000000000000000000000000000000000000000000000000000000000000000002008012014C7FFFFFFFFFFFFFFFFFFFFBFFFFFFFDFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFBFFFFFFFFFFFFFFFFFFFFFFFF9FFFFFFFFFFFFFFFFF7FFFF7FBFFFFFFFFFFBFFFFFFFDFFFFFFFFEFFFFFFFFFFFFFFFFFDF567677FFFFFFFFFFFFFFFFFFBFFFFFFBE6000000003FC0080000000001FFFFFFFFFFFFFFFFFC0000003FFFFFFFFFFFFFFF8000000000000000000000000FFFC40000000001FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFCFFFFE600000000001FCCFFFE4FF39C00000000008000000003F67F50000000000000000000000000000003FFE3F9F93FFFBFEFFF2E001FFFFFFFFF810E2000EC0F0304C000000003FFFFFFFFFFFFFFFFF7E000000000000000001EFE0FFFC580187F87C0000000000000000000000000000000040000FF0000000000000000000000000000000000000000003FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDFFFFC00003FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFF7FF9FFDFFFDF9FBFEEC000000003FFFFFFFFFFFFFFFFC000003F800000000FFFFBFFFFFFFFFFEFFFBFFFFFFDF7FFFFFC',
        chunk_size: 524288,
        chunk_completed: 2204,
        createdAt: 1539860537,
        active: true,
        open: true,
        complete: false,
        hashing: false,
        hashed: true,
        leechers: 1,
        seeders: 99,
        free_disk_space: 24319991808,
        left_bytes: 844103680,
        label: '',
        addtime: 1552911761,
        ratio: 0,
        files: [
          {
            range_first: '0',
            range_second: '3814',
            size: '1999503360',
            chunks: '3814',
            completed_chunks: '2257',
            fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
            path: 'ubuntu-18.10-desktop-amd64.iso',
            priority: '1',
            is_created: '1',
            is_open: '1',
            last_touched: '1552911778926106',
            match_depth_next: '0',
            match_depth_prev: '0',
            offset: '0',
            path_components: ['ubuntu-18.10-desktop-amd64.iso'],
            path_depth: '1'
          },
          {
            range_first: '0',
            range_second: '3814',
            size: '1999503360',
            chunks: '3814',
            completed_chunks: '2257',
            fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso2',
            path: 'ubuntu-18.10-desktop-amd64.iso2',
            priority: '1',
            is_created: '1',
            is_open: '1',
            last_touched: '1552911778926106',
            match_depth_next: '0',
            match_depth_prev: '0',
            offset: '0',
            path_components: ['ubuntu-18.10-desktop-amd64.iso'],
            path_depth: '1'
          }
        ],
        trackers: [
          {
            id: '',
            group: '0',
            type: '1',
            url: 'http://torrent.ubuntu.com:6969/announce',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '2466',
            scrape_downloaded: '0',
            scrape_incomplete: '80',
            scrape_time_last: '1552911761'
          },
          {
            id: '',
            group: '1',
            type: '1',
            url: 'http://ipv6.torrent.ubuntu.com:6969/announce',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '0',
            scrape_downloaded: '0',
            scrape_incomplete: '0',
            scrape_time_last: '0'
          },
          {
            id: '',
            group: '2',
            type: '3',
            url: 'dht://',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '0',
            scrape_downloaded: '0',
            scrape_incomplete: '0',
            scrape_time_last: '0'
          }
        ],
        peers: [
          {
            address: '5.196.88.106',
            client_version: 'libTorrent 0.13.4.0',
            completed_percent: '100',
            down_rate: '778263',
            down_total: '23347901',
            id: '2D6C74304434302D2E697D2C09A14E81754FB89F',
            port: '45000',
            up_rate: '0',
            up_total: '0'
          },
          {
            address: '185.162.184.7',
            client_version: 'DelugeTorrent 1.3.15.0',
            completed_percent: '100',
            down_rate: '16490475',
            down_total: '494714257',
            id: '2D4445313346302D72285F346C29433429784E39',
            port: '63920',
            up_rate: '0',
            up_total: '0'
          },
          {
            address: '95.211.168.14',
            client_version: 'libTorrent 0.13.6.0',
            completed_percent: '100',
            down_rate: '3787883',
            down_total: '113636496',
            id: '2D6C74304436302D9E2EF75841AEA9C6F8B27457',
            port: '61056',
            up_rate: '0',
            up_total: '0'
          }
        ]
      },
      {
        hash: '4A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA',
        torrent: '',
        torrentsession: '',
        path: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso',
        name: 'ubuntu-14.04.6-desktop-amd64.iso',
        size: 1157627904,
        skip: 0,
        completed: 541589504,
        down_rate: 9475376,
        down_total: 568522562,
        up_rate: 0,
        up_total: 0,
        message: "Tracker: [Couldn't resolve host name]",
        bitfield: 7,
        chunk_size: 524288,
        chunk_completed: 1033,
        createdAt: 1551970024,
        active: true,
        open: true,
        complete: false,
        hashing: false,
        hashed: true,
        leechers: 0,
        seeders: 36,
        free_disk_space: 24319991808,
        left_bytes: 616038400,
        label: '',
        addtime: 1552911761,
        ratio: 0,
        files: [
          {
            range_first: '0',
            range_second: '2208',
            size: '1157627904',
            chunks: '2208',
            completed_chunks: '2208',
            fullpath: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso',
            path: 'ubuntu-14.04.6-desktop-amd64.iso',
            priority: '1',
            is_created: '1',
            is_open: '1',
            last_touched: '1552911778934093',
            match_depth_next: '0',
            match_depth_prev: '0',
            offset: '0',
            path_components: ['ubuntu-14.04.6-desktop-amd64.iso'],
            path_depth: '1'
          }
        ],
        trackers: [
          {
            id: '',
            group: '0',
            type: '1',
            url: 'http://torrent.ubuntu.com:6969/announce',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '155',
            scrape_downloaded: '0',
            scrape_incomplete: '7',
            scrape_time_last: '1552911761'
          },
          {
            id: '',
            group: '1',
            type: '1',
            url: 'http://ipv6.torrent.ubuntu.com:6969/announce',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '0',
            scrape_downloaded: '0',
            scrape_incomplete: '0',
            scrape_time_last: '0'
          },
          {
            id: '',
            group: '2',
            type: '3',
            url: 'dht://',
            enabled: '1',
            open: '0',
            min_interval: '600',
            normal_interval: '1800',
            scrape_complete: '0',
            scrape_downloaded: '0',
            scrape_incomplete: '0',
            scrape_time_last: '0'
          }
        ],
        peers: [
          {
            address: '195.154.163.119',
            client_version: 'DelugeTorrent 1.3.15.0',
            completed_percent: '100',
            down_rate: '1183898',
            down_total: '35516963',
            id: '2D4445313346302D486633746A3838686E307863',
            port: '6881',
            up_rate: '0',
            up_total: '0'
          },
          {
            address: '81.171.17.42',
            client_version: 'libTorrent 0.13.6.0',
            completed_percent: '100',
            down_rate: '4083218',
            down_total: '122496557',
            id: '2D6C74304436302DB4E9B6602AC0CD74A0036A3E',
            port: '49011',
            up_rate: '0',
            up_total: '0'
          },
          {
            address: '45.67.159.123',
            client_version: 'libTorrent 0.13.6.0',
            completed_percent: '100',
            down_rate: '886210',
            down_total: '26586300',
            id: '2D6C74304436302D40E9CBE2005FE5E021F3BA9E',
            port: '55600',
            up_rate: '0',
            up_total: '0'
          },
          {
            address: '94.21.65.11',
            client_version: 'libTorrent 0.13.7.0',
            completed_percent: '100',
            down_rate: '490763',
            down_total: '14722896',
            id: '2D6C74304437302D8007DDD5678166E6783E462F',
            port: '25252',
            up_rate: '0',
            up_total: '0'
          }
        ]
      }
    ]
  };

  static readonly MOCK_ANSWER_STATUS = {
    down_rate: '28',
    down_total: '463360286085',
    up_rate: '191',
    up_total: '1293694778894',
    free_disk_space: 24319991808,
    free_disk_space_local: 1234567
  };
  static readonly MOCK_ANSWER_STATUS_WITHOUT_LOCAL = {
    down_rate: '28',
    down_total: '463360286085',
    up_rate: '191',
    up_total: '1293694778894',
    free_disk_space: 24319991808
  };
  static readonly MOCK_ANSWER_GLOBAL = {
    down_rate: '28',
    down_total: '463360286085',
    up_rate: '191',
    up_total: '1293694778894'
  };
  //noinspection SpellCheckingInspection
  static readonly MOCK_ANSWER_TORRENTS = [
    {
      hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
      path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      name: 'ubuntu-18.10-desktop-amd64.iso',
      size: 1999503360,
      completed: 1155399680,
      down_rate: 19944210,
      down_total: 1196652654,
      downloaded: 399900672,
      up_rate: 0,
      up_total: 0,
      createdAt: 1539860537,
      addtime: 1552911761,
      complete: false,
      leechers: 1,
      seeders: 99,
      ratio: 0,
      active: true,
      open: true,
      shouldDownload: false,
      files: [
        {
          range_first: '0',
          range_second: '3814',
          size: '1999503360',
          chunks: '3814',
          completed_chunks: '2257',
          downloaded: 199950336,
          fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
          path: 'ubuntu-18.10-desktop-amd64.iso',
          priority: '1',
          is_created: '1',
          is_open: '1',
          last_touched: '1552911778926106',
          match_depth_next: '0',
          match_depth_prev: '0',
          offset: '0',
          path_components: ['ubuntu-18.10-desktop-amd64.iso'],
          path_depth: '1',
          shouldDownload: false
        },
        {
          range_first: '0',
          range_second: '3814',
          size: '1999503360',
          chunks: '3814',
          completed_chunks: '2257',
          downloaded: 199950336,
          fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso2',
          path: 'ubuntu-18.10-desktop-amd64.iso2',
          priority: '1',
          is_created: '1',
          is_open: '1',
          last_touched: '1552911778926106',
          match_depth_next: '0',
          match_depth_prev: '0',
          offset: '0',
          path_components: ['ubuntu-18.10-desktop-amd64.iso'],
          path_depth: '1',
          shouldDownload: false
        }
      ]
    },
    {
      hash: '4A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA',
      path: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso',
      name: 'ubuntu-14.04.6-desktop-amd64.iso',
      size: 1157627904,
      completed: 541589504,
      down_rate: 9475376,
      down_total: 568522562,
      downloaded: 0,
      up_rate: 0,
      up_total: 0,
      createdAt: 1551970024,
      addtime: 1552911761,
      complete: false,
      leechers: 0,
      seeders: 36,
      ratio: 0,
      active: true,
      open: true,
      shouldDownload: false,
      files: [
        {
          range_first: '0',
          range_second: '2208',
          size: '1157627904',
          chunks: '2208',
          completed_chunks: '2208',
          downloaded: 0,
          fullpath: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso',
          path: 'ubuntu-14.04.6-desktop-amd64.iso',
          priority: '1',
          is_created: '1',
          is_open: '1',
          last_touched: '1552911778934093',
          match_depth_next: '0',
          match_depth_prev: '0',
          offset: '0',
          path_components: ['ubuntu-14.04.6-desktop-amd64.iso'],
          path_depth: '1'
        }
      ]
    }
  ];
  //noinspection SpellCheckingInspection
  static readonly MOCK_ANSWER_HASH = '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67';
  //noinspection SpellCheckingInspection
  static readonly MOCK_ANSWER_FILES = [
    {
      range_first: '0',
      range_second: '3814',
      size: '1999503360',
      chunks: '3814',
      completed_chunks: '2257',
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      path: 'ubuntu-18.10-desktop-amd64.iso',
      priority: '1',
      is_created: '1',
      is_open: '1',
      last_touched: '1552911778926106',
      match_depth_next: '0',
      match_depth_prev: '0',
      offset: '0',
      path_components: ['ubuntu-18.10-desktop-amd64.iso'],
      path_depth: '1',
      shouldDownload: false
    },
    {
      range_first: '0',
      range_second: '3814',
      size: '1999503360',
      chunks: '3814',
      completed_chunks: '2257',
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso2',
      path: 'ubuntu-18.10-desktop-amd64.iso2',
      priority: '1',
      is_created: '1',
      is_open: '1',
      last_touched: '1552911778926106',
      match_depth_next: '0',
      match_depth_prev: '0',
      offset: '0',
      path_components: ['ubuntu-18.10-desktop-amd64.iso'],
      path_depth: '1',
      shouldDownload: false
    }
  ];
}

describe('RtorrentService', () => {
  let rtorrentService: RtorrentService;
  let configService: ConfigService;
  let ftpSeedService: FtpSeedService;

  void beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtorrentService, ConfigService, { provide: FtpSeedService, useClass: FtpSeedServiceMock }]
    }).compile();
    rtorrentService = module.get<RtorrentService>(RtorrentService);
    jest.spyOn(rtorrentService.logger, 'error').mockImplementation(() => {});

    configService = module.get<ConfigService>(ConfigService);
    jest.spyOn(configService.logger, 'error').mockImplementation(() => {});
    configService.forceConfigFile('env-model.json');

    ftpSeedService = module.get<FtpSeedService>(FtpSeedService);
  });

  void it('should be defined', () => {
    expect(rtorrentService).toBeDefined();
  });

  describe('getStatus', () => {
    void it('getStatus return should cannot connect', done => {
      rtorrentService.getStatus().catch(err => {
        expect(err).not.toBeNull();
        expect(err.code).toEqual('ECONNREFUSED');
        done();
      });
    });

    void it('getStatus return should be ok', done => {
      rtorrentService.forceRtorrentForMocking(new RtorrentMock());

      const disk = require('diskusage');
      jest.spyOn(disk, 'check').mockImplementation(() => {
        return new Promise(resolve => {
          resolve({ available: 123456, free: 1234567, total: 12345678 });
        });
      });

      rtorrentService.getStatus().then(data => {
        expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_STATUS);
        done();
      });
    });
    void it('getStatus return should be ko on error', done => {
      const rtorrentMock = new RtorrentMock();
      rtorrentMock.getAllError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);

      rtorrentService.getStatus().catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
        done();
      });
    });
  });
  void it('getStatus return should be ok/ko on path local not existing', done => {
    rtorrentService.forceRtorrentForMocking(new RtorrentMock());

    const disk = require('diskusage');
    jest.spyOn(disk, 'check').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject();
      });
    });

    rtorrentService.getStatus().then(data => {
      expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_STATUS_WITHOUT_LOCAL);
      done();
    });
  });

  describe('getGlobals', () => {
    void it('getGlobals return should be ok', done => {
      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      rtorrentService.getGlobals((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_GLOBAL);
        done();
      });
    });
  });

  describe('getTorrents', () => {
    void it('getTorrents return should be ok', done => {
      const spyOnsetProgression = jest.spyOn(ftpSeedService, 'setProgression');

      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      rtorrentService.getTorrents().then(data => {
        expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);

        expect(spyOnsetProgression).toHaveBeenCalledTimes(1);
        done();
      });
    });
    void it('getTorrents return should be ko on error', done => {
      const rtorrentMock = new RtorrentMock();
      rtorrentMock.getAllError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);
      rtorrentService.getTorrents().catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
        done();
      });
    });
  });

  describe('actions on torrents', () => {
    void it('pause start and remove return should be ok', done => {
      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      rtorrentService.getTorrents().then(data1 => {
        expect(data1).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);

        // first on pause the good hash should be not active
        rtorrentService.pauseTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).then(data2 => {
          const result1 = [];
          RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
            const t1 = { ...t };
            result1.push(t1);
            if (t.hash === RtorrentServiceTestValues.MOCK_ANSWER_HASH) {
              t1.active = false;
            }
          });

          expect(data2).toEqual(result1);

          // then on start the good hash should be active again
          rtorrentService.startTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).then(data3 => {
            expect(data3).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);

            // then on remove, it should disappear
            rtorrentService.removeTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).then(data4 => {
              const result2 = [];
              RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
                const t1 = { ...t };
                if (t.hash !== RtorrentServiceTestValues.MOCK_ANSWER_HASH) {
                  result2.push(t1);
                }
              });
              expect(data4).toEqual(result2);
              done();
            });
          });
        });
      });
    });

    void it('error should be managed', async () => {
      expect.assertions(14);

      // pause
      let rtorrentMock = new RtorrentMock();
      rtorrentMock.pauseError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);
      rtorrentService.pauseTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      rtorrentMock.pauseError = false;
      rtorrentMock.getAllError = true;
      rtorrentService.pauseTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      // Start
      rtorrentMock = new RtorrentMock();
      rtorrentMock.stopError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);
      rtorrentService.startTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      rtorrentMock.stopError = false;
      rtorrentMock.startError = true;
      rtorrentService.startTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      rtorrentMock.startError = false;
      rtorrentMock.getAllError = true;
      rtorrentService.startTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      // Remove
      rtorrentMock = new RtorrentMock();
      rtorrentMock.removeAndEraseError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);
      rtorrentService.removeTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      rtorrentMock.removeAndEraseError = false;
      rtorrentMock.getAllError = true;
      rtorrentService.removeTorrent(RtorrentServiceTestValues.MOCK_ANSWER_HASH).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });
    });
  });

  describe('switch "shall we download" on torrents', () => {
    void it('return should be ok', done => {
      expect.assertions(2);

      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      rtorrentService.switchShouldDownload(RtorrentServiceTestValues.MOCK_ANSWER_HASH, true).then(data1 => {
        const result = [];
        RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS.forEach(t => {
          const t1 = { ...t };
          t1.files = [];
          t.files.forEach(f => {
            t1.files.push({ ...f });
          });
          if (t.hash === RtorrentServiceTestValues.MOCK_ANSWER_HASH) {
            t1.shouldDownload = true;
            t1.files.forEach(f => {
              f.shouldDownload = true;
            });
          }
          result.push(t1);
        });

        expect(data1).toEqual(result);

        rtorrentService.switchShouldDownload(RtorrentServiceTestValues.MOCK_ANSWER_HASH, false).then(data2 => {
          expect(data2).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);

          done();
        });
      });
    });

    void it('error should be managed', async () => {
      expect.assertions(4);

      // pause
      const rtorrentMock = new RtorrentMock();
      rtorrentMock.getTorrentFilesError = true;
      rtorrentService.forceRtorrentForMocking(rtorrentMock);
      rtorrentService.switchShouldDownload(RtorrentServiceTestValues.MOCK_ANSWER_HASH, false).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });

      rtorrentMock.getTorrentFilesError = false;
      rtorrentMock.getAllError = true;
      rtorrentService.switchShouldDownload(RtorrentServiceTestValues.MOCK_ANSWER_HASH, true).catch(err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-1);
      });
    });
  });

  describe('getTorrentFiles', () => {
    void it('getTorrentFiles return should be ko on wrong hash', done => {
      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      //noinspection SpellCheckingInspection
      rtorrentService.getTorrentFiles('5A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA', err => {
        expect(err).not.toBeNull();
        expect(err.faultCode).toEqual(-501);
        expect(err.faultString).toEqual('Could not find info-hash.');
        done();
      });
    });

    void it('getTorrentFiles return should be ok', done => {
      rtorrentService.forceRtorrentForMocking(new RtorrentMock());
      rtorrentService.getTorrentFiles(RtorrentServiceTestValues.MOCK_ANSWER_HASH, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_FILES);
        done();
      });
    });
  });

  describe('intervalJob', () => {
    it('should launch getTorrents', () => {
      jest.spyOn(rtorrentService.logger, 'error').mockClear();
      jest.spyOn(rtorrentService, 'getTorrents').mockClear();
      jest.spyOn(rtorrentService, 'getTorrents').mockImplementation(() => {
        return new Promise<RtorrentTorrent[]>(collect => {
          collect([]);
        });
      });

      expect(rtorrentService.intervalJob_RtorrentService()).toBeFalsy();
      expect(jest.spyOn(rtorrentService, 'getTorrents')).toHaveBeenCalledTimes(1);
      expect(jest.spyOn(rtorrentService.logger, 'error')).toHaveBeenCalledTimes(0);
    });
    it('should launch getTorrents and managed error', async () => {
      jest.spyOn(rtorrentService, 'getTorrents').mockClear();
      jest.spyOn(rtorrentService, 'getTorrents').mockImplementation(() => {
        return new Promise<RtorrentTorrent[]>((collect, reject) => {
          reject(new Error());
        });
      });
      jest.spyOn(rtorrentService.logger, 'error').mockImplementation(() => {});

      expect(await rtorrentService.intervalJob_RtorrentService()).toBeFalsy();
      expect(jest.spyOn(rtorrentService, 'getTorrents')).toHaveBeenCalledTimes(1);
      expect(jest.spyOn(rtorrentService.logger, 'error')).toHaveBeenCalledTimes(1);
    });
  });
});

export class FtpSeedServiceMock {
  shouldDownloaded = {};

  //noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
  getPathLocal() {
    return '.';
  }

  //noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
  getProgression(fullPath: string): Progression {
    switch (fullPath) {
      case '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso':
        return {
          fullPath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
          shouldDownload: this.shouldDownloaded[fullPath] === true,
          progress: 11,
          size: 1999503360,
          value: 199950336
        };
      case '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso2':
        return {
          fullPath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso2',
          shouldDownload: this.shouldDownloaded[fullPath] === true,
          progress: 11,
          size: 1999503360,
          value: 199950336
        };
      default:
        return null;
    }
  }

  //noinspection JSUnusedGlobalSymbols
  switchShouldDownload(fullPath: string, size: number, should: boolean) {
    this.shouldDownloaded[fullPath] = should;
  }

  //noinspection JSUnusedGlobalSymbols
  setProgression() {}
  //noinspection JSUnusedGlobalSymbols
  tellProgressionUseful() {}
}

export class RtorrentMock {
  getGlobalsError = false;
  getAllError = false;
  getTorrentFilesError = false;
  pauseError = false;
  stopError = false;
  startError = false;
  removeAndEraseError = false;

  paused = {};
  removed = {};

  getGlobals(callback) {
    if (this.getGlobalsError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      callback(
        null,
        _.pick(RtorrentServiceTestValues.FAKE_RTORRENT_RETURN, ['down_rate', 'down_total', 'up_rate', 'up_total'])
      );
    }
  }

  getAll(callback) {
    if (this.getAllError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      const all = { ...RtorrentServiceTestValues.FAKE_RTORRENT_RETURN };

      all.torrents = all.torrents.filter(t => {
        return !this.removed[t.hash];
      });
      all.torrents.forEach(t => {
        t.active = !this.paused[t.hash];
      });

      callback(null, all);
    }
  }

  getTorrentFiles(hash, callback) {
    if (this.getTorrentFilesError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      if (hash === RtorrentServiceTestValues.MOCK_ANSWER_HASH) {
        callback(null, RtorrentServiceTestValues.FAKE_RTORRENT_RETURN.torrents[0].files);
      } else {
        callback(
          {
            code: -501,
            faultCode: -501,
            faultString: 'Could not find info-hash.'
          },
          null
        );
      }
    }
  }

  pause(hash, callback) {
    if (this.pauseError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      this.paused[hash] = true;
      callback();
    }
  }

  stop(hash, callback) {
    if (this.stopError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      this.paused[hash] = true;
      callback();
    }
  }

  start(hash, callback) {
    if (this.startError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      this.paused[hash] = false;
      callback();
    }
  }

  removeAndErase(hash, callback) {
    if (this.removeAndEraseError) {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    } else {
      this.removed[hash] = true;
      callback();
    }
  }
}
