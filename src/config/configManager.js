import defaultConfig from '../../config/default.json';

class ConfigManager {
  static getConfig(key) {
    const localConfig = localStorage.getItem('appConfig');
    const config = localConfig ? JSON.parse(localConfig) : defaultConfig;
    return key ? config[key] : config;
  }

  static updateConfig(updates) {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    localStorage.setItem('appConfig', JSON.stringify(newConfig));
    return newConfig;
  }

  static resetToDefault() {
    localStorage.removeItem('appConfig');
    return defaultConfig;
  }
}