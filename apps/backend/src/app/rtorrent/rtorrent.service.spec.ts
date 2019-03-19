import { Test, TestingModule } from '@nestjs/testing';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';
import * as _ from 'lodash';

export class RtorrentServiceTestValues {
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
            completed_chunks: '1058',
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

  static readonly MOCK_TORRENT = {
    getGlobals: callback => {
      callback(
        null,
        _.pick(RtorrentServiceTestValues.FAKE_RTORRENT_RETURN, ['down_rate', 'down_total', 'up_rate', 'up_total'])
      );
    },
    getAll: callback => {
      callback(null, RtorrentServiceTestValues.FAKE_RTORRENT_RETURN);
    },
    getTorrentFiles: (hash, callback) => {
      if (hash === RtorrentServiceTestValues.MOCK_ANSWER_HASH) {
        callback(null, RtorrentServiceTestValues.FAKE_RTORRENT_RETURN.torrents[1].files);
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
  };
  static readonly MOCK_TORRENT_ERR = {
    getGlobals: callback => {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    },
    getAll: callback => {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    },
    getTorrentFiles: (hash, callback) => {
      callback(
        {
          code: -1,
          faultCode: -1,
          faultString: 'Error found.'
        },
        null
      );
    }
  };

  static readonly MOCK_ANSWER_STATUS = {
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
  static readonly MOCK_ANSWER_TORRENTS = [
    {
      hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
      path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      name: 'ubuntu-18.10-desktop-amd64.iso',
      size: 1999503360,
      completed: 1155399680,
      down_rate: 19944210,
      down_total: 1196652654,
      up_rate: 0,
      up_total: 0,
      createdAt: 1539860537,
      addtime: 1552911761,
      complete: false,
      leechers: 1,
      seeders: 99,
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
      up_rate: 0,
      up_total: 0,
      createdAt: 1551970024,
      addtime: 1552911761,
      complete: false,
      leechers: 0,
      seeders: 36,
      ratio: 0,
      files: [
        {
          range_first: '0',
          range_second: '2208',
          size: '1157627904',
          chunks: '2208',
          completed_chunks: '1058',
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
  static readonly MOCK_ANSWER_HASH = '4A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA';
  static readonly MOCK_ANSWER_FILES = [
    {
      range_first: '0',
      range_second: '2208',
      size: '1157627904',
      chunks: '2208',
      completed_chunks: '1058',
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
  ];
}

describe('RtorrentService', () => {
  let rtorrentService: RtorrentService;
  let configService: ConfigService;

  void beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RtorrentService, ConfigService]
    }).compile();
    rtorrentService = module.get<RtorrentService>(RtorrentService);

    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
  });

  void it('should be defined', () => {
    expect(rtorrentService).toBeDefined();
  });

  void it('getStatus return should cannot connect', done => {
    rtorrentService.getStatus().catch(err => {
      expect(err).not.toBeNull();
      expect(err.code).toEqual('ECONNREFUSED');
      done();
    });
  });

  void it('getStatus return should be ok', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    rtorrentService.getStatus().then(data => {
      expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_STATUS);
      done();
    });
  });
  void it('getStatus return should be ko on error', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT_ERR);
    rtorrentService.getStatus().catch(err => {
      expect(err).not.toBeNull();
      expect(err.faultCode).toEqual(-1);
      done();
    });
  });

  void it('getGlobals return should be ok', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    rtorrentService.getGlobals((err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_GLOBAL);
      done();
    });
  });

  void it('getTorrents return should be ok', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    rtorrentService.getTorrents((err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_TORRENTS);
      done();
    });
  });

  void it('getTorrentFiles return should be ko on wrong hash', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    rtorrentService.getTorrentFiles('5A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA', err => {
      expect(err).not.toBeNull();
      expect(err.faultCode).toEqual(-501);
      expect(err.faultString).toEqual('Could not find info-hash.');
      done();
    });
  });

  void it('getTorrentFiles return should be ok', done => {
    rtorrentService.forceRtorrentForMocking(RtorrentServiceTestValues.MOCK_TORRENT);
    rtorrentService.getTorrentFiles(RtorrentServiceTestValues.MOCK_ANSWER_HASH, (err, data) => {
      expect(err).toBeNull();
      expect(data).toEqual(RtorrentServiceTestValues.MOCK_ANSWER_FILES);
      done();
    });
  });
});
