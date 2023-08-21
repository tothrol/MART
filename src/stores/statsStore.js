import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';

// import { capacitorUsageStatsManager } from 'capacitor-usage-stats-manager';
import { useUserStore } from '@/stores/userStore';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { useQuestionsStore } from '@/stores/questionsStore';
import { Storage } from '@ionic/storage';
// import dayjs from 'dayjs';

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
        timestamp: '',
        iosStats: '',
        iosStats2: '',
        deviceInfoString: '',
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
          resolve(permission);
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
    async getStats(today, time, dateLong, timestamp) {
      try {
        console.log('getStats');
        const questionsStore = useQuestionsStore();

        const storage = new Storage();
        await storage.create();
        let lastStats = await storage.get('lastStats');
        console.log('getStats - lastStats:', lastStats);

        // Only for controlling in Devbox
        questionsStore.lastStats = lastStats;

        let lastAnswerMs;

        if (!lastStats) {
          lastAnswerMs = 0;
        } else {
          lastAnswerMs = lastStats;
        }

        // if (
        //   questionsStore.shortAnswersArray.length === 0 &&
        //   questionsStore.initialAnswerTimestamp === 0
        // ) {
        //   // No initial Answer, No shortAnswer
        //   lastAnswerMs = 0;
        // } else if (
        //   questionsStore.shortAnswersArray.length === 0 &&
        //   questionsStore.initialAnswerTimestamp != 0
        // ) {
        //   // initial Answer exists, short answers does not exist.
        //   lastAnswerMs = questionsStore.initialAnswerTimestamp;
        // } else if (questionsStore.shortAnswersArray.length != 0) {
        //   // Short Answer does exist
        //   lastAnswerMs = questionsStore.lastShortAnswerMs;
        // }

        // const deviceInfo = await Device.getInfo();

        let platform = Capacitor.getPlatform();

        if (platform != 'ios' && platform != 'web') {
          // let queryUsageStats = await echo.getStats();

          // START calc hours back
          // How many hours back should the Android stats last
          let hours;
          if (lastAnswerMs === 0) {
            hours = 24 * 30;
          } else {
            hours = (timestamp - lastAnswerMs) / 1000 / 60 / 60;
            console.log('getStats - hours: ', hours);
            hours = Math.round(hours);
            console.log('getStats - hours - rounded: ', hours);
            hours = hours + 2;
            console.log('getStats - hours - +2: ', hours);
          }

          hours = hours.toString();

          // END calc hours back

          let queryUsageStats = await echo.getStats({
            hours: hours,
          });
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
          // console.log('queryUsageStats - string: ', queryUsageStatsString);
          // END queryUsageStats

          // queryEventStats
          // let queryEventStats = await echo.getEventStats();
          let queryEventStats = await echo.getEventStatsDetail({
            hours: hours,
          });
          // console.log('getEventStats - queryEventStats -: ', queryEventStats);
          let queryEventStatsJSON = JSON.parse(
            queryEventStats.androidEventStats
          );
          // console.log(
          //   'getEventStats - queryEventStatsJSON: ',
          //   queryEventStatsJSON
          // );
          let queryEventStatsStringify = JSON.stringify(queryEventStatsJSON);
          // console.log(
          //   'getEventStats - queryEventStatsStringify: ',
          //   queryEventStatsStringify
          // );

          let queryEventStatsString = queryEventStatsStringify.substring(
            1,
            queryEventStatsStringify.length - 1
          );
          // console.log('getEventStats - string: ', queryEventStatsString);
          // End queryEventStats

          let deviceInfoString = '';

          await this.sendStatistics(
            today,
            time,
            dateLong,
            timestamp,
            queryUsageStatsString,
            queryEventStatsString,
            deviceInfoString,

            '',
            ''
          );
        } else {
          // on ios
          let deviceInfoString = '';

          this.iosClipboard = {
            today: today,
            time: time,
            dateLong: dateLong,
            timestamp: timestamp,
            iosStats: null,
            iosStats2: null,
            deviceInfoString: deviceInfoString,
          };

          // await this.sendStatistics(
          //   today,
          //   time,
          //   dateLong,
          //   'ios',
          //   'ios',
          //   deviceInfoString,

          // );
        }

        await storage.set('lastStats', timestamp);
        console.log('getStats - lastStats:', timestamp);

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('Stats were send');
          // }
        });
      } catch (e) {
        console.log('getEventStats - Error: ', e);
        return new Promise((reject) => {
          // if (response.status == 200) {

          reject(e);
          // }
        });
      }
    },
    async sendDeviceInfos(today, time, dateLong, timestamp) {
      try {
        console.log('statsStore - sendDeviceInfo');

        const deviceInfo = await Device.getInfo();

        console.log('statsStore - sendDeviceInfo - deviceInfo: ', deviceInfo);

        let deviceInfoString = JSON.stringify(deviceInfo);

        let platform = Capacitor.getPlatform();

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
            deviceInfoStats: deviceInfoString,

            userNameStats: userStore.userData.username,
            dateStats: today,
            timeStats: time,
            dateLongStats: dateLong,
            timestamp: timestamp,
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
          `https://martappserver.de/wp-json/wp/v2/device-infos`,
          body,
          config
        );

        // JSON responses are automatically parsed.

        console.log('statsStore - sendDeviceInfo - response', response);

        if (response.status === 201) {
          console.log('statsStore - sendDeviceInfo - response', response);
          return new Promise((resolve) => {
            // if (response.status == 200) {
            resolve(response);
            // }
          });
        }
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          console.log('statsStore - sendDeviceInfo - e: ', e);
          reject(e);
          // }
        });
      }
    },

    async sendIosStats(iosStats) {
      let { hours, minutes, activations } = iosStats;
      let iosScreentimeString = `${hours}:${minutes}`;
      console.log('statsStore - sendIosStats', iosScreentimeString);
      try {
        let result = await this.sendStatistics(
          this.iosClipboard.today,
          this.iosClipboard.time,
          this.iosClipboard.dateLong,
          this.iosClipboard.timestamp,
          '',
          '',
          this.iosClipboard.deviceInfoString,

          iosScreentimeString,
          activations
        );
        if (result.status == 201) {
          this.iosClipboard = {
            today: '',
            time: '',
            dateLong: '',
            timestamp: '',
            iosStats: '',
            iosStats2: '',
            deviceInfoString: '',
          };
        }

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
      timestamp,
      queryUsageStatsString,
      queryEventStatsString,
      deviceInfoString,

      iosScreenTime,
      iosActivations
    ) {
      try {
        console.log(
          'statsStore - sendStatistics',
          today,
          time,
          dateLong,
          timestamp,
          queryUsageStatsString,
          queryEventStatsString,
          deviceInfoString,

          iosScreenTime,
          iosActivations
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

            userNameStats: userStore.userData.username,
            dateStats: today,
            timeStats: time,
            dateLongStats: dateLong,
            timestamp: timestamp,
            uniqueUserIdStats: userStore.uniqueUserId,
            iosscreentime: iosScreenTime,
            iosactivations: iosActivations.toString(),
          },
          slug: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          title: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          status: 'publish',
          meta: {
            uniqueUserId: userStore.uniqueUserId,
          },
        };

        const response = await axios.post(
          `https://martappserver.de/wp-json/wp/v2/nutzungsstatistik`,
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
