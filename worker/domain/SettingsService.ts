import type { Env } from '../core-utils';
import type { Settings } from '@shared/types';

const SETTINGS_KEY = 'settings';

export class SettingsService {
  static async getSettings(env: Env): Promise<Partial<Settings>> {
    const settingsJson = await env.STORAGE.get(SETTINGS_KEY);
    if (!settingsJson) {
      return {};
    }
    try {
      return JSON.parse(settingsJson) as Partial<Settings>;
    } catch {
      return {};
    }
  }

  static async updateSettings(env: Env, settingsData: Partial<Settings>): Promise<Partial<Settings>> {
    const currentSettings = await this.getSettings(env);
    const updatedSettings = { ...currentSettings, ...settingsData };
    await env.STORAGE.put(SETTINGS_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}
