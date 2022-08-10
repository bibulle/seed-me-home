import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilesCleanerService {
  static readonly KEY_CLEANERS_LOCAL_STORAGE = 'cleaners';

  static readonly CLEANERS_DEFAULT = [
    'Repack',
    'Multi',
    'BDrip',
    'DVDrip',
    'HDRip',
    'WEBRip',
    'VDRip',
    'Xvid',
    'AC-3-UTT',
    '[-]*UTT[-]*',
    '[-]*LECHTI[-]*',
    'TrueFrench',
    'VOSTFR',
    'MAGNET',
    'HDTV',
    'PTN',
    'PROPER',
    'SSL',
    '[-]*GKS',
    '[-]RAW',
    '[-]PROTEiGON',
    '[-]F4ST',
    'x264',
    'H.264',
    'BluRay',
    'TDPG',
    'FTMVHD',
    'FRENCH',
    'PDTV',
    '-2T',
    '[-]FiXi0N',
    'CCS3',
    'ATeam',
    'ViGi',
    'NSP',
    'SN2P',
    'AMZN',
    'ARK01',
    'HEVC',
    'x265',
    'AAC',
    'AC3',
    'HVS',
    'DD5.1',
    'AAC5.1',
    '1080p',
    '720p',
    'WEB-DL',
    'HDLight',
    'SEEHD',
  ];

  private cleaners = FilesCleanerService.CLEANERS_DEFAULT;
  private readonly cleanersSubject: BehaviorSubject<string[]>;

  constructor() {
    try {
      this.cleaners = JSON.parse(localStorage.getItem(FilesCleanerService.KEY_CLEANERS_LOCAL_STORAGE));
      if (!this.cleaners) {
        this.cleaners = FilesCleanerService.CLEANERS_DEFAULT;
      }
    } catch {
      this.cleaners = FilesCleanerService.CLEANERS_DEFAULT;
    }

    this.cleanersSubject = new BehaviorSubject<string[]>(this.cleaners);
  }

  getCleaners(): string[] {
    return this.cleaners;
  }

  setCleaners(text: string) {
    if (text) {
      const tabs = text.split(',').map((w) => {
        return w.trim();
      });
      // console.log(tabs);
      this.cleaners = tabs;
      localStorage.setItem(FilesCleanerService.KEY_CLEANERS_LOCAL_STORAGE, JSON.stringify(tabs));
      this.cleanersSubject.next(this.cleaners);
    }
  }

  cleanersObservable(): Observable<string[]> {
    return this.cleanersSubject;
  }
}
