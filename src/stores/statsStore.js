import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { echo } from 'echo';
import { useUserStore } from '@/stores/userStore';
// import { useQuestionsStore } from '@/stores/questionsStore';
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
    // getStats from Android

    async checkAndroidPermissions() {
      try {
        let permission = await echo.checkUsageStatsPermission();
        console.log('checkAndroidPermissionss', permission);

        // let data = await permission.json();
        // console.log('checkAndroidPermissionss data', data);
        // let data2 = JSON.parse(data);
        // console.log('checkAndroidPermissionss data2', data2);

        return permission;
      } catch (e) {
        return e;
      }
    },
    async checkAndSetAndroidPermissions() {
      try {
        let permission = await echo.checkAndSetUsageStatsPermission();
        console.log('checkAndSetAndroidPermissions', permission);

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('resolved');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    async getStats(today, time, dateLong) {
      try {
        console.log('getStats');

        // let permission = await echo.checkAndSetUsageStatsPermission();

        // queryUsageStats
        // console.log('getStats -STATSPermission', permission);
        let queryUsageStats = await echo.getStats();
        // console.log('queryUsageStats - stats: ', queryUsageStats);
        let queryUsageStatsJSON = JSON.parse(queryUsageStats.androidUsageStats);
        let queryUsageStatsStringify = JSON.stringify(queryUsageStatsJSON);
        // console.log('queryUsageStats - parse: ', queryUsageStatsJSON);

        // delete first and last letter which is "
        let queryUsageStatsString = queryUsageStatsStringify.substring(
          1,
          queryUsageStatsStringify.length - 1
        );
        console.log('queryUsageStats - string: ', queryUsageStatsString);
        // END queryUsageStats

        // queryEventStats
        let queryEventStats = await echo.getEventStats();
        // console.log('getEventStats - stats: ', queryEventStats);
        let queryEventStatsJSON = JSON.parse(queryEventStats.androidEventStats);
        let queryEventStatsStringify = JSON.stringify(queryEventStatsJSON);
        // console.log('getEventStats - parse: ', queryEventStatsJSON);
        // console.log('getEventStats - stringify: ', queryEventStatsStringify);

        let queryEventStatsString = queryEventStatsStringify.substring(
          1,
          queryEventStatsStringify.length - 1
        );
        console.log('getEventStats - string: ', queryEventStatsString);
        // End queryEventStats

        // for (let i = 0; i<= queryEventStatsJSON.length(); i++){
        //   queryEventStatsString += ' ';
        //   queryEventStatsString += '|';

        // }

        await this.sendStatistics(
          today,
          time,
          dateLong,
          queryUsageStatsString,
          queryEventStatsString
        );

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('Stats were send');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },

    async sendStatistics(
      today,
      time,
      dateLong,
      queryUsageStatsString,
      queryEventStatsString
    ) {
      const userStore = useUserStore();
      // const statsStore = useStatsStore();

      const token = userStore.userData.token;

      // const queryUsageStatsString = queryUsageStats.toString();
      // const queryEventStatsString = queryEventStats.toString();

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const body = {
        acf: {
          userIdStats: userStore.userData.id,
          queryUsageStats: queryUsageStatsString,
          queryEventStats: queryEventStatsString,
          userNameStats: userStore.userData.username,
          dateStats: today,
          timeStats: time,
          dateLongStats: dateLong,
          uniqueUserIdStats: userStore.uniqueUserId,
        },
        slug: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
        title: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
        status: 'publish',
        meta: {
          uniqueUserId: userStore.uniqueUserId,
        },
      };

      const response = await axios.post(
        `https://fuberlin.nvii-dev.com/wp-json/wp/v2/nutzungsstatistik`,
        body,
        config
      );

      // JSON responses are automatically parsed.

      console.log('questionsStore - sendShortAnswers - response', response);

      if (response.status === 201) {
        console.log('questionsStore - sendShortAnswers - response', response);
        return response;
      }
    },
  },
  getters: {},
});
