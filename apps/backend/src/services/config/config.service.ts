import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

//noinspection JSUnusedLocalSymbols
const debug = require('debug')('server:debug:config');
const error = require('debug')('server:error:config');

class Config {
  public version = 'VERSION_PLACEHOLDER';

  public seedbox_mode = '';
  public seedbox_host = '';
  public seedbox_port = '';
  public seedbox_path = '';
  public seedbox_user = '';
  public seedbox_pass = '';

  public node_env = process.env.NODE_ENV || 'development';
}

@Injectable()
export class ConfigService {
  private _config: Config;

  private _configFile = 'env-my-own.json';

  private initialize() {
    // initialize
    if (!this._config) {
      this._config = new Config();

      // Check the user env
      if (!fs.existsSync(__dirname + '/' + this._configFile)) {
        error("Your environment is not set, create the '" + __dirname + '/' + this._configFile + "' file.");
        error("   on can copy it from the 'config/env-model.json' file.");
        process.exit(1);
      } else {
        // read it
        const env = require('./' + this._configFile);

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
}
