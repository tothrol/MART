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

      let permission = await echo.checkForUsageStatsPermission();
      console.log('STATSPermission', permission);
      let stats = await echo.getStats();

      // let statsString = JSON.stringify(stats).replace(/\\/g, '');
      // let statsString2 = statsString.replace;
      // console.log('STATS 1: ' + stats);
      // console.log('STATS 2: ' + stats.androidUsageStats);

      // let myObject = JSON.parse(stats.androidUsageStats);
      // console.log('STATS 6: ' + myObject);

      let newString = stats.androidUsageStats.slice(
        2,
        stats.androidUsageStats.length - 2
      );
      // console.log('STATS 1: ', newString);

      let statsArray = newString.split('},{');
      console.log('STATS 2: ', statsArray);
      // console.log('STATS 3: ', statsArray[1]);

      // let statsString = newString.replace(/({})/g, '');
      // console.log('STATS 8: ' + statsString);

      // var newJson = stats.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
      // newJson = newJson.replace(/'/g, '"');

      // var data = JSON.parse(newJson);
      // console.log('STATS 7: ' + data);
    },
  },
  getters: {},
});
