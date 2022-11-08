import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { echo } from 'echo';
// import cordova from 'cordova';
// import getUsageStatistics from 'cordova-plugin-usage-stats-manager';
// import { Storage } from '@ionic/storage';
// import { useQuestionsStore } from '@/stores/questionsStore';
// import { queryUsageStats } from 'capacitor-usage-stats-manager';

export const useStatsStore = defineStore('statsStore', {
  state: () => {
    return {};
  },
  actions: {
    async getStats() {
      console.log('getStats');
      // queryUsageStats('test');
      // queryUsageStats('tt');
      // let stats = await echo.echo({ value: 'test' });
      let stats = await echo.echo();
      console.log('STATS STOREEEEEEEEP', stats);
      console.log(stats.value);
      console.log('STATS 3', stats);
      // echo.stats('statTest');
    },
  },
  getters: {},
});
