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
  private static _config: Config;

  private static _configFile = 'env-my-own.json';

  static initialize() {
    // initialize
    if (!ConfigService._config) {
      ConfigService._config = new Config();

      // Check the user env
      if (!fs.existsSync(__dirname + '/' + this._configFile)) {
        error("Your environment is not set, create the '" + __dirname + '/' + this._configFile + "' file.");
        error("   on can copy it from the 'config/env-model.json' file.");
        process.exit(1);
      } else {
        // read it
        const env = require('./' + this._configFile);

        for (const attrName in env[ConfigService._config.node_env]) {
          if (env[ConfigService._config.node_env].hasOwnProperty(attrName)) {
            ConfigService._config[attrName] = env[ConfigService._config.node_env][attrName];
          }
        }
      }
    }
  }

  public static forceConfigFile(file: string) {
    delete ConfigService._config;
    ConfigService._configFile = file;
    ConfigService.initialize();
  }

  public static getSeedboxMode() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_mode;
  }

  public static getSeedboxHost() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_host;
  }

  public static getSeedboxPort() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_port;
  }

  public static getSeedboxPath() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_path;
  }

  public static getSeedboxUser() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_user;
  }

  public static getSeedboxPass() {
    ConfigService.initialize();
    return ConfigService._config.seedbox_pass;
  }
}
