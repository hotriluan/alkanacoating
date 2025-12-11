import { create } from 'zustand';
import api from '../services/api';

const useSettingsStore = create((set, get) => ({
  settings: {},
  loading: false,
  error: null,

  fetchSettings: async (groupKey = 'contact') => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/settings/group/${groupKey}`);
      const settingsData = res.data.data || res.data;
      const settingsObj = {};
      if (Array.isArray(settingsData)) {
        settingsData.forEach(setting => { settingsObj[setting.key] = setting.value; });
      } else {
        Object.assign(settingsObj, settingsData);
      }
      set(state => ({
        settings: { ...state.settings, ...settingsObj },
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ error: 'Không thể tải cài đặt', loading: false });
    }
  },

  getSetting: (key) => get().settings[key],
}));

export default useSettingsStore;
