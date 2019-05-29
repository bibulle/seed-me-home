import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { environment } from '../../environments/environment';

class Config {
  public version = 'VERSION_PLACEHOLDER';

  public seedbox_mode = '';
  public seedbox_host = '';
  public seedbox_port = 0;
  public seedbox_path = '';
  public seedbox_user = '';
  public seedbox_pass = '';

  public seedbox_ftp_host = '';
  public seedbox_ftp_port = 0;
  public seedbox_ftp_user = '';
  public seedbox_ftp_pass = '';
  public seedbox_ftp_path = '';
  public seedbox_ftp_disabled = false;

  public path_download = 'downloaded';
  public path_progress = 'progress';

  public path_nas = './nas';
  public path_movies = 'movies';
  public path_series = 'series';

  public users_authorized = [];
  public users_admin = [];

  public authent_jwt_secret = '';

  public authent_google_clientID = '';
  public authent_google_clientSecret = '';
  public authent_google_callbackURL = '';

  public node_env = environment.production ? 'production' : 'development';
}

@Injectable()
export class ConfigService {
  readonly logger = new Logger(ConfigService.name);

  private _config: Config;

  private _configFile = 'env-my-own.json';

  private initialize() {
    // initialize
    if (!this._config) {
      this._config = new Config();

      //this._config.node_env = process.env.NODE_ENV || 'development';
      this.logger.log('environment : ' + this._config.node_env);

      // Check the user env
      if (!fs.existsSync(__dirname + '/' + this._configFile)) {
        this.logger.error(
          "ERROR : Your environment is not set, create the '" + __dirname + '/' + this._configFile + "' file."
        );
        this.logger.error("          you can copy it from the 'config/env-model.json' file.");
        process.exit(1);
      } else {
        // read it
        const rawData = fs.readFileSync(__dirname + '/' + this._configFile);
        const env = JSON.parse(rawData.toString());

        for (const attrName in env[this._config.node_env]) {
          if (env[this._config.node_env].hasOwnProperty(attrName)) {
            this._config[attrName] = env[this._config.node_env][attrName];
          }
        }
      }
    }
  }

  public forceConfigFile(file: string) {
    delete this._config;
    this._configFile = file;
    this.initialize();
  }

  public getSeedboxMode() {
    this.initialize();
    return this._config.seedbox_mode;
  }

  public getSeedboxHost() {
    this.initialize();
    return this._config.seedbox_host;
  }

  public getSeedboxPort() {
    this.initialize();
    return this._config.seedbox_port;
  }

  public getSeedboxPath() {
    this.initialize();
    return this._config.seedbox_path;
  }

  public getSeedboxUser() {
    this.initialize();
    return this._config.seedbox_user;
  }

  public getSeedboxPass() {
    this.initialize();
    return this._config.seedbox_pass;
  }

  public getSeedboxFtpHost() {
    this.initialize();
    return this._config.seedbox_ftp_host;
  }

  public getSeedboxFtpPort() {
    this.initialize();
    return this._config.seedbox_ftp_port;
  }

  public getSeedboxFtpUser() {
    this.initialize();
    return this._config.seedbox_ftp_user;
  }

  public getSeedboxFtpPass() {
    this.initialize();
    return this._config.seedbox_ftp_pass;
  }

  public getSeedboxFtpPath() {
    this.initialize();
    return this._config.seedbox_ftp_path;
  }

  public getSeedboxFtpDisabled() {
    this.initialize();
    return this._config.seedbox_ftp_disabled;
  }

  public getPathDownload() {
    this.initialize();
    return this._config.path_download;
  }

  public getPathProgress() {
    this.initialize();
    return this._config.path_progress;
  }

  public getPathNas() {
    this.initialize();
    return this._config.path_nas;
  }

  getPathMovies() {
    this.initialize();
    return this._config.path_movies;
  }

  getPathSeries() {
    this.initialize();
    return this._config.path_series;
  }

  public getAuthentGoogleClientID() {
    this.initialize();
    return this._config.authent_google_clientID;
  }

  public getAuthentGoogleClientSecret() {
    this.initialize();
    return this._config.authent_google_clientSecret;
  }

  public getAuthentGoogleCallbackURL() {
    this.initialize();
    return this._config.authent_google_callbackURL;
  }

  public getAuthentJwtSecret() {
    this.initialize();
    return this._config.authent_jwt_secret;
  }

  public getUsersAuthorized() {
    this.initialize();
    return this._config.users_authorized;
  }

  public getUsersAdmin() {
    this.initialize();
    return this._config.users_admin;
  }
}
