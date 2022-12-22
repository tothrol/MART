import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';

// import { capacitorUsageStatsManager } from 'capacitor-usage-stats-manager';
import { useUserStore } from '@/stores/userStore';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

let platform = Capacitor.getPlatform();

import { echo } from 'echo';

// import { useQuestionsStore } from '@/stores/questionsStore';
// import cordova from 'cordova';
// import getUsageStatistics from 'cordova-plugin-usage-stats-manager';
// import { Storage } from '@ionic/storage';
// import { useQuestionsStore } from '@/stores/questionsStore';
// import { queryUsageStats } from 'capacitor-usage-stats-manager';

export const useStatsStore = defineStore('statsStore', {
  state: () => {
    return {
      iosClipboard: {
        today: '',
        time: '',
        dateLong: '',
        iosStats: '',
        iosStats2: '',
        deviceInfoString: '',
        deviceUuid: '',
      },
    };
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

    async broadcast() {
      // console.log('broadcast');
      // let broadcast = await echo.MyBroadcastReceiver();
      // console.log('broadcast', broadcast);
    },
    async getStats(today, time, dateLong) {
      try {
        console.log('getStats');

        const deviceInfo = await Device.getInfo();
        const deviceUuid = await Device.getId();

        console.log('statsStore - getDeviceInfo - deviceUuid: ', deviceUuid);

        console.log('statsStore - getDeviceInfo - deviceInfo: ', deviceInfo);

        let deviceInfoString = JSON.stringify(deviceInfo);

        let platform = Capacitor.getPlatform();

        if (platform != 'ios') {
          let queryUsageStats = await echo.getStats();
          // console.log('queryUsageStats - stats: ', queryUsageStats);
          let queryUsageStatsJSON = JSON.parse(
            queryUsageStats.androidUsageStats
          );
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
          let queryEventStatsJSON = JSON.parse(
            queryEventStats.androidEventStats
          );
          let queryEventStatsStringify = JSON.stringify(queryEventStatsJSON);

          let queryEventStatsString = queryEventStatsStringify.substring(
            1,
            queryEventStatsStringify.length - 1
          );
          console.log('getEventStats - string: ', queryEventStatsString);
          // End queryEventStats

          await this.sendStatistics(
            today,
            time,
            dateLong,
            queryUsageStatsString,
            queryEventStatsString,
            deviceInfoString,
            deviceUuid.uuid
          );
        } else {
          // on ios

          this.iosClipboard = {
            today: today,
            time: time,
            dateLong: dateLong,
            iosStats: null,
            iosStats2: null,
            deviceInfoString: deviceInfoString,
            deviceUuid: deviceUuid.uuid,
          };

          // await this.sendStatistics(
          //   today,
          //   time,
          //   dateLong,
          //   'ios',
          //   'ios',
          //   deviceInfoString,
          //   deviceUuid.uuid
          // );
        }

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

    async sendIosStats(iosStats) {
      let iosStatsString = iosStats.toString();
      console.log('statsStore - sendIosStats', iosStatsString);
      try {
        let result = await this.sendStatistics(
          this.iosClipboard.today,
          this.iosClipboard.time,
          this.iosClipboard.dateLong,
          iosStatsString,
          'iosStats2',
          this.iosClipboard.deviceInfoString,
          this.iosClipboard.deviceUuid
        );

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve(result);
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

    async getDeviceInfo() {
      try {
        const logDeviceInfo = async () => {
          const info = await Device.getInfo();

          console.log('statsStore - getDeviceInfo: ', info);
        };

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('device Info resolve');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          console.log('statsStore - getDeviceInfo - e: ', e);
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
      queryEventStatsString,
      deviceInfoString,
      deviceUuid
    ) {
      try {
        console.log(
          'statsStore - sendStatistics',
          today,
          time,
          dateLong,
          queryUsageStatsString,
          queryEventStatsString,
          deviceInfoString,
          deviceUuid
        );
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
            deviceInfoStats: deviceInfoString,
            deviceUuidStats: deviceUuid,
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

        console.log('statsStore - sendShortAnswers - response', response);

        if (response.status === 201) {
          console.log('statsStore - sendShortAnswers - response', response);
          return new Promise((resolve) => {
            // if (response.status == 200) {
            resolve(response);
            // }
          });
        }
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          console.log('statsStore - getDeviceInfo - e: ', e);
          reject(e);
          // }
        });
      }
    },
  },
  getters: {},
});
