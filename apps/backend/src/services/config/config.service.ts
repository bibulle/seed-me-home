import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { environment } from '../../environments/environment';

class Config {
  public version = 'VERSION_PLACEHOLDER';

  public seedbox_mode: string;
  public seedbox_host: string;
  public seedbox_port: number;
  public seedbox_path: string;
  public seedbox_user: string;
  public seedbox_pass: string;

  public seedbox_ftp_host: string;
  public seedbox_ftp_port: number;
  public seedbox_ftp_user: string;
  public seedbox_ftp_pass: string;
  public seedbox_ftp_path: string;
  public seedbox_ftp_disabled: boolean;
  public static readonly SEEDBOX_FTP_DISABLED = false;

  public path_download: string;
  public static readonly PATH_DOWNLOAD = '/downloaded';
  public path_progress: string;
  public static readonly PATH_PROGRESS = '/progress';

  public path_nas: string;
  public static readonly PATH_NAS = '/nas';
  public path_movies: string;
  public static readonly PATH_MOVIES = 'movies';
  public path_series: string;
  public static readonly PATH_SERIES = 'series';

  public users_authorized = [];
  public users_admin = [];

  public authent_jwt_secret: string;

  public authent_google_clientID: string;
  public authent_google_clientSecret: string;
  public authent_google_callbackURL: string;

  public node_env = environment.production ? 'production' : 'development';
}

@Injectable()
export class ConfigService {
  readonly logger = new Logger(ConfigService.name);

  private _config: Config;

  private _configFile = 'env-my-own.json';

  private _hasBeenInitialized = false;
  private initialize(name: string, ignore_error = false) {
    // initialize
    if (!this._hasBeenInitialized) {
      this._hasBeenInitialized = true;

      this._config = new Config();

      //this._config.node_env = process.env.NODE_ENV || 'development';
      this.logger.log(`environment : ${this._config.node_env}`);
      // this.logger.log(`              ${name} ${ignore_error}`)

      // Check the user env
      if (!fs.existsSync(__dirname + '/' + this._configFile)) {
        if (!ignore_error) {
          this.logger.error(
            `ERROR : Looking for '${name}'... not in environment variable`
          );
          this.logger.error(
            `        Your environment is not set, create the '${__dirname}/${this._configFile}' file.`
          );
          this.logger.error(
            `          you can copy it from the 'config/env-model.json' file.`
          );
          process.exit(1);
        } else {
          this._config = undefined;
        }
      } else {
        // read it
        const rawData = fs.readFileSync(__dirname + '/' + this._configFile);
        const env = JSON.parse(rawData.toString());

        for (const attrName in env[this._config.node_env]) {
          // eslint-disable-next-line no-prototype-builtins
          if (env[this._config.node_env].hasOwnProperty(attrName)) {
            this._config[attrName] = env[this._config.node_env][attrName];
          }
        }
      }
    }
  }

  // public forceConfigFile(file: string) {
  //   delete this._config;
  //   this._configFile = file;
  //   this.initialize();
  // }

  public getSeedboxMode(): string {
    if (process.env.SEEDBOX_MODE !== undefined) {
      return process.env.SEEDBOX_MODE;
    }
    this.initialize('SEEDBOX_MODE');
    return this._config.seedbox_mode;
  }

  public getSeedboxHost(): string {
    if (process.env.SEEDBOX_HOST !== undefined) {
      return process.env.SEEDBOX_HOST;
    }
    this.initialize('SEEDBOX_HOST');
    return this._config.seedbox_host;
  }

  public getSeedboxPort(): number {
    if (process.env.SEEDBOX_PORT !== undefined) {
      return parseInt(process.env.SEEDBOX_PORT);
    }
    this.initialize('SEEDBOX_PORT');
    return this._config.seedbox_port;
  }

  public getSeedboxPath(): string {
    if (process.env.SEEDBOX_PATH !== undefined) {
      return process.env.SEEDBOX_PATH;
    }
    this.initialize('SEEDBOX_PATH');
    return this._config.seedbox_path;
  }

  public getSeedboxUser(): string {
    if (process.env.SEEDBOX_USER !== undefined) {
      return process.env.SEEDBOX_USER;
    }
    this.initialize('SEEDBOX_USER');
    return this._config.seedbox_user;
  }

  public getSeedboxPass(): string {
    if (process.env.SEEDBOX_PASS !== undefined) {
      return process.env.SEEDBOX_PASS;
    }
    this.initialize('SEEDBOX_PASS');
    return this._config.seedbox_pass;
  }

  public getSeedboxFtpHost(): string {
    if (process.env.SEEDBOX_FTP_HOST !== undefined) {
      return process.env.SEEDBOX_FTP_HOST;
    }
    this.initialize('SEEDBOX_FTP_HOST');
    return this._config.seedbox_ftp_host;
  }

  public getSeedboxFtpPort(): number {
    if (process.env.SEEDBOX_FTP_PORT !== undefined) {
      return parseInt(process.env.SEEDBOX_FTP_PORT);
    }
    this.initialize('SEEDBOX_FTP_PORT');
    return this._config.seedbox_ftp_port;
  }

  public getSeedboxFtpUser(): string {
    if (process.env.SEEDBOX_FTP_USER !== undefined) {
      return process.env.SEEDBOX_FTP_USER;
    }
    this.initialize('SEEDBOX_FTP_USER');
    return this._config.seedbox_ftp_user;
  }

  public getSeedboxFtpPass(): string {
    if (process.env.SEEDBOX_FTP_PASS !== undefined) {
      return process.env.SEEDBOX_FTP_PASS;
    }
    this.initialize('SEEDBOX_FTP_PASS');
    return this._config.seedbox_ftp_pass;
  }

  public getSeedboxFtpPath(): string {
    if (process.env.SEEDBOX_FTP_PATH !== undefined) {
      return process.env.SEEDBOX_FTP_PATH;
    }
    this.initialize('SEEDBOX_FTP_PATH');
    return this._config.seedbox_ftp_path;
  }

  public getSeedboxFtpDisabled(): boolean {
    if (process.env.SEEDBOX_FTP_DISABLED !== undefined) {
      return process.env.SEEDBOX_FTP_DISABLED === 'true';
    }
    this.initialize('SEEDBOX_FTP_DISABLED', true);
    if (this._config) {
      return this._config.seedbox_ftp_disabled;
    }
    return Config.SEEDBOX_FTP_DISABLED;
  }

  public getPathDownload(): string {
    if (process.env.PATH_DOWNLOAD !== undefined) {
      return process.env.PATH_DOWNLOAD;
    }
    this.initialize('PATH_DOWNLOAD', true);
    if (this._config) {
      return this._config.path_download;
    }
    return Config.PATH_DOWNLOAD;
  }

  public getPathProgress(): string {
    if (process.env.PATH_PROGRESS !== undefined) {
      return process.env.PATH_PROGRESS;
    }
    this.initialize('PATH_PROGRESS', true);
    if (this._config) {
      return this._config.path_progress;
    }
    return Config.PATH_PROGRESS;
  }

  public getPathNas(): string {
    if (process.env.PATH_NAS !== undefined) {
      return process.env.PATH_NAS;
    }
    this.initialize('PATH_NAS', true);
    if (this._config) {
      return this._config.path_nas;
    }
    return Config.PATH_NAS;
  }

  getPathMovies(): string {
    if (process.env.PATH_MOVIES !== undefined) {
      return process.env.PATH_MOVIES;
    }
    if (this._config.path_movies !== undefined) {
      return this._config.path_movies;
    }
    this.initialize('PATH_MOVIES', true);
    if (this._config) {
      return this._config.path_movies;
    }
    return Config.PATH_MOVIES;
  }

  getPathSeries(): string {
    if (process.env.PATH_SERIES !== undefined) {
      return process.env.PATH_SERIES;
    }
    if (this._config.path_series !== undefined) {
      return this._config.path_series;
    }
    this.initialize('PATH_SERIES', true);
    if (this._config) {
      return this._config.path_series;
    }
    return Config.PATH_SERIES;
  }

  public getAuthentGoogleClientID(): string {
    if (process.env.AUTHENT_GOOGLE_CLIENT_ID !== undefined) {
      return process.env.AUTHENT_GOOGLE_CLIENT_ID;
    }
    this.initialize('AUTHENT_GOOGLE_CLIENT_ID');
    return this._config.authent_google_clientID;
  }

  public getAuthentGoogleClientSecret(): string {
    if (process.env.AUTHENT_GOOGLE_CLIENT_SECRET !== undefined) {
      return process.env.AUTHENT_GOOGLE_CLIENT_SECRET;
    }
    this.initialize('AUTHENT_GOOGLE_CLIENT_SECRET');
    return this._config.authent_google_clientSecret;
  }

  public getAuthentGoogleCallbackURL(): string {
    if (process.env.AUTHENT_GOOGLE_CALLBACK_URL !== undefined) {
      return process.env.AUTHENT_GOOGLE_CALLBACK_URL;
    }
    this.initialize('AUTHENT_GOOGLE_CALLBACK_URL');
    return this._config.authent_google_callbackURL;
  }

  public getAuthentJwtSecret(): string {
    if (process.env.AUTHENT_JWT_SECRET !== undefined) {
      return process.env.AUTHENT_JWT_SECRET;
    }
    this.initialize('AUTHENT_JWT_SECRET');
    return this._config.authent_jwt_secret;
  }

  public getUsersAuthorized(): string[] {
    if (process.env.AUTHENT_USER_AUTHORIZED !== undefined) {
      return process.env.AUTHENT_USER_AUTHORIZED.split(',').map((s) => {
        return s.trim();
      });
    }
    this.initialize('AUTHENT_USER_AUTHORIZED');
    return this._config.users_authorized;
  }

  public getUsersAdmin(): string[] {
    if (process.env.AUTHENT_USERS_ADMIN !== undefined) {
      return process.env.AUTHENT_USERS_ADMIN.split(',').map((s) => {
        return s.trim();
      });
    }
    this.initialize('AUTHENT_USERS_ADMIN');
    return this._config.users_admin;
  }
}
