import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import { useUserStore } from '@/stores/userStore';
import { useStatsStore } from '@/stores/statsStore';
import axios from 'axios';
import { toDisplayString, toRaw } from 'vue';
import dayjs from 'dayjs';
import { Storage } from '@ionic/storage';
import { useInfoStore } from '@/stores/infoStore';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

let platform = Capacitor.getPlatform();

export const useQuestionsStore = defineStore('questionsStore', {
  state: () => {
    return {
      sheetsInitial: {},
      questionsInitial: {},
      batteriesInitial: {},
      scalesInitial: {},

      sheetsShort: {},
      questionsShort: {},
      batteriesShort: {},
      scalesShort: {},

      initialAnswerExist: false,
      initialAnswerTimestamp: 0,
      timerShortQuestionsRuns: false,

      lastShortAnswer: '',
      lastShortAnswerMs: 0,
      nextShortAnswerMs: 0,
      timestampQuestionsShortStarted: 0,
      timestampQuestionsInitialStarted: 0,

      todayShortAnswers: 0,
      shortAnswersArray: [],
      todayShortAnswersArray: [],
      totalShortAnswers: 0,

      lastStats: 0,
    };
  },
  actions: {
    async getInitialQuestions() {
      try {
        let response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen`
        );

        if (response.status === 200) {
          // JSON responses are automatically parsed.
          // console.log('RRRRR', response);

          const sheets = response.data[0].acf.questionsRepeater;
          const batteries = response.data[0].acf.batteries;
          const scales = response.data[0].acf.scalesRepeater;

          for (let i = 0; i < sheets.length; i++) {
            this.sheetsInitial[i + 1] = sheets[i];
          }

          for (const sheet of sheets) {
            if (sheet.itemId != undefined && sheet.itemId != '')
              this.questionsInitial[sheet.itemId] = sheet;
          }
          for (const battery of batteries) {
            this.batteriesInitial[battery.batteryId] = battery;
          }
          for (const scale of scales) {
            this.scalesInitial[scale.scaleId] = scale;
          }
        }

        console.log(
          'questionsStore - getInitialQuestions -  getIQ response: ',
          response
        );

        return new Promise((resolve) => {
          console.log(
            'questionsStore - getInitialQuestions - resolvw - getIQ response: '
          );
          resolve({
            sheetsInitial: this.sheetsInitial,
            scalesInitial: this.scalesInitial,
            batteriesInitial: this.batteriesInitial,
            status: response.status,
          });
        });
      } catch (e) {
        return new Promise((reject) => {
          console.log(
            'questionsStore - getInitialQuestions - resolv - getIQ error: ',
            e
          );
          reject(e);
        });
      }
    },
    async sendInitialAnswers(answers) {
      try {
        this.showSpinner = true;
        // console.log('questionsStore - sendInitialAnswers - answers', answers);

        const userStore = useUserStore();
        // console.log(
        //   'questionsStore - sendInitialAnswers - answers - user',
        //   userStore.userData
        // );
        const token = userStore.userData.token;

        const answersString = JSON.stringify(answers);

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const dayJs = dayjs();

        const today = dayJs.format('DD.MM.YYYY');
        const time = dayJs.format('HH:mm');
        const dateLong = dayJs.format();
        const timestamp = dayJs.valueOf();

        const body = {
          acf: {
            userId: userStore.userData.id,
            userName: userStore.userData.username,
            date: today,
            time: time,
            timestamp: timestamp,
            answers: answersString,
            dateLong: dateLong,
            uniqueUserId: userStore.uniqueUserId,
            timestampStart: this.timestampQuestionsInitialStarted,
          },
          slug: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          title: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          status: 'publish',
          meta: {
            uniqueUserId: userStore.uniqueUserId,
          },
        };

        const response = await axios.post(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial`,
          body,
          config
        );

        // JSON responses are automatically parsed.

        // console.log('questionsStore - sendInitialAnswers - response', response);
        const statsStore = useStatsStore();

        await statsStore.getStats(today, time, dateLong, timestamp);

        await statsStore.sendDeviceInfos(today, time, dateLong, timestamp);

        if (response.status === 201) {
          // console.log('questionsStore - sendInitialAnswers - response = 201');
          // userStore.showQuestions = true;

          this.initialAnswerExist = true;
          console.log(
            'sendInitialAnswers - initialAnswerExist: ',
            this.initialAnswerExist
          );
          const storage = new Storage();
          await storage.create();
          await storage.set('initialAnswerExist', true);

          this.initialAnswerTimestamp = timestamp;

          await storage.set('initialAnswerTimestamp', timestamp);

          const infoStore = useInfoStore();

          infoStore.calculateDatesAndTimes(toRaw(infoStore.datesAndTimes));
        } else {
          // Error handling here
          // console.log('questionsStore - sendInitialAnswers - response = NOT 201');
        }

        // await this.sendStatistics(today, time, dateLong);

        // return response;

        return new Promise((resolve) => {
          console.log(
            'questionsStore - sendInitialAnswers - resolv - response: ',
            response
          );
          resolve(response);
        });
      } catch (e) {
        return new Promise((reject) => {
          console.log('questionsStore - sendInitialAnswers - reject - e: ', e);
          reject(e);
        });
      }
    },
    async checkIfInitialAnswerExists() {
      const userStore = useUserStore();
      const storage = new Storage();
      await storage.create();
      // console.log(
      //   'questionsStore - checkIfInitialAnswersExists - userID',
      //   userStore.uniqueUserId
      // );

      if (userStore.uniqueUserId === 'startId') {
        console.log('UNIQUE USER ID = startId');
      }
      if (userStore.userData.id != 0 && userStore.userData.id != '') {
        try {
          const response = await axios.get(
            `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial/?meta_key=uniqueUserId&meta_value=${userStore.uniqueUserId}`
          );

          console.log(
            'questionsStore - checkIfInitialAnswersExists - response',
            response
          );
          if (response.data.length >= 1) {
            console.log(
              'questionsStore - checkIfInitialAnswersExists - TRUE',
              response
            );
            this.initialAnswerExist = true;
            this.initialAnswerTimestamp = response.data[0].acf.timestamp;

            await storage.set('initialAnswerExist', true);
            await storage.set(
              'initialAnswerTimestamp',
              response.data[0].acf.timestamp
            );
            // userStore.showQuestions = true;

            return new Promise((resolve) => {
              // if (response.status == 200) {
              resolve(response);
              // }
            });
          } else {
            this.initialAnswerExist = false;
            await storage.set('initialAnswerExist', false);

            this.initialAnswerTimestamp = 0;

            await storage.set('initialAnswerTimestamp', 0);

            return new Promise((resolve) => {
              // if (response.status == 200) {
              resolve(response);
              // }
            });
          }
        } catch (e) {
          return new Promise((reject) => {
            // if (response.status == 200) {
            reject(e);
            // }
          });
        }
      }
    },

    // Questions Short
    async getShortQuestions() {
      try {
        let response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/kurzfragebogen`
        );

        // JSON responses are automatically parsed.
        console.log('questionsStore - getShortQuestions - response', response);

        const sheets = response.data[0].acf.questionRepeater_k;
        const batteries = response.data[0].acf.batteries_k;
        const scales = response.data[0].acf.scalesRepeater_k;

        console.log(
          'questionsStore - getShortQuestions - response ---',
          response
        );

        for (let i = 0; i < sheets.length; i++) {
          if (sheets[i].itemId_k != undefined && sheets[i].itemId_k != '') {
            this.questionsShort[sheets[i].itemId_k] = {
              batteryId: sheets[i].batteryId_k,
              choiceId: sheets[i].choiceId_k,
              itemId: sheets[i].itemId_k,
              item: sheets[i].item_k,
              scaleId: sheets[i].skaleId_k,
              options: sheets[i].options,
            };
          }
          this.sheetsShort[i + 1] = {
            batteryId: sheets[i].batteryId_k,
            choiceId: sheets[i].choiceId_k,
            itemId: sheets[i].itemId_k,
            item: sheets[i].item_k,
            scaleId: sheets[i].skaleId_k,
            options: sheets[i].options,
          };
        }
        for (const battery of batteries) {
          this.batteriesShort[battery.batteryId_k] = {
            batteryId: battery.batteryId_k,
            batteryName: battery.batteryName_k,
            batteryText: battery.batteryText_k,
            batteryMeta: battery.batteryMeta_k,
            options: battery.options,
          };
        }
        for (const scale of scales) {
          const scaleRep = [];
          for (const [index, repeater] of Object.entries(
            scale.scaleRepeater_k
          )) {
            scaleRep.push({
              key: repeater.key_k,
              value: repeater.value_k,
            });
          }
          this.scalesShort[scale.skaleId_k] = {
            choiceId: scale.choiceId_k,
            scaleRepeater: scaleRep,
            scaleId: scale.skaleId_k,
            options: scale.options,
          };
        }

        // console.log(
        //   'questionsStore - getShortQuestions - response',
        //   response
        // );

        return new Promise((resolve) => {
          console.log('questionsStore - getShortQuestions - resolve', response);
          resolve({
            sheetsShort: this.sheetsShort,
            scalesShort: this.scalesShort,
            batteriesShort: this.batteriesShort,
            status: response.status,
          });
          // }
        });
      } catch (e) {
        console.log('questionsStore - getShortQuestions - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    async sendShortAnswers(answers, todayShortAnswers) {
      try {
        this.showSpinner = true;
        console.log('questionsStore - sendShortAnswers - answers', answers);
        const userStore = useUserStore();
        const token = userStore.userData.token;
        // console.log('questionsStore - sendShortAnswers - token', token);

        const answersString = JSON.stringify(answers);

        const now = dayjs();
        const today = now.format('DD.MM.YYYY');
        const time = now.format('HH:mm');
        const dateLong = now.format();
        const timestamp = now.valueOf();
        console.log('DateLong', dateLong);

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const body = {
          acf: {
            userId_k: userStore.userData.id,
            answers_k: answersString,
            userName_k: userStore.userData.username,
            date_k: today,
            time_k: time,
            dateLong_k: dateLong,
            uniqueUserId_k: userStore.uniqueUserId,
            timestamp_k: timestamp,

            timestampStart_k: this.timestampQuestionsShortStarted,
          },
          slug: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          title: `${userStore.userData.username}_${userStore.uniqueUserId}_${today}_${time}`,
          status: 'publish',
          meta: {
            uniqueUserId: userStore.uniqueUserId,
          },
        };

        const response = await axios.post(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb`,
          body,
          config
        );

        // JSON responses are automatically parsed.

        console.log('questionsStore - sendShortAnswers - response', response);

        console.log('sendShortAnswers - todayShortAnswers:', todayShortAnswers);

        if (todayShortAnswers === 0) {
          const statsStore = useStatsStore();
          // only send stats if its the first questionsShort of the day
          await statsStore.getStats(today, time, dateLong, timestamp);
        }

        if (response.status === 201) {
          console.log('sendShortAnswers - response = 201');
          let infoStore = useInfoStore();
          this.lastShortAnswer = dateLong;
          this.lastShortAnswerMs = now.valueOf();

          // console.log(
          //   'sendShortAnswers - infoStore.breakBetweenShortQuestions',
          //   infoStore.breakBetweenShortQuestions
          // );
          // this.nextShortAnswerMs = now
          //   .add(infoStore.breakBetweenShortQuestions, 'minute')
          //   .valueOf();
          // console.log(
          //   'sendShortAnswers - this.nextShortAnswerMs',
          //   this.nextShortAnswerMs
          // );
          const storage = new Storage();
          await storage.create();
          await storage.set('lastShortAnswer', dateLong);

          await storage.set('lastShortAnswerMs', this.lastShortAnswerMs);

          // await storage.set('nextShortAnswerMs', this.nextShortAnswerMs);
          this.shortAnswersArray.push(now.valueOf());

          await this.calculateTodayShortAnswers();

          this.totalShortAnswers++;

          await storage.set('totalShortAnswers', this.totalShortAnswers);

          await userStore.setNotifications();
        }
        // await this.countShortAnswers();

        // await this.sendStatistics(today, time, dateLong);

        return new Promise((resolve) => {
          console.log('questionsStore - sendShortAnswers - resolve', response);
          resolve(response);
          // }
        });
      } catch (e) {
        console.log('questionsStore - sendShortAnswers - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },

    async calculateTodayShortAnswers() {
      try {
        // From the value of this.shortAnswersArray the rest will be calculated
        if (this.shortAnswersArray.length != 0) {
          const storage = new Storage();
          await storage.create();
          // START calculating todayShortAnswers
          this.todayShortAnswersArray = [];

          for (let answer of this.shortAnswersArray) {
            if (
              dayjs(answer).format('DD.MM.YYYY') ===
              dayjs().format('DD.MM.YYYY')
            ) {
              this.todayShortAnswersArray.push(answer);
            }
          }
          this.todayShortAnswers = this.todayShortAnswersArray.length;
          await storage.set(
            'todayShortAnswersArray',
            toRaw(this.todayShortAnswersArray)
          );
          await storage.set('shortAnswersArray', toRaw(this.shortAnswersArray));

          await storage.set('todayShortAnswers', toRaw(this.todayShortAnswers));
          // END calculating todayShortAnswers

          return new Promise((resolve) => {
            console.log(
              'questionsStore - calculateTodayShortAnswers - resolve'
            );
            resolve('done');
            // }
          });
        }
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    todayShortPlus() {
      // For Testing
      this.todayShortAnswers++;

      const dateLong = dayjs().format();
      this.lastShortAnswer = dateLong;
    },
    async getLastShortAnswer() {
      const userStore = useUserStore();

      const userId = userStore.userData.id;

      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb/?meta_key=uniqueUserId&meta_value=${userStore.uniqueUserId}&per_page=1`
        );

        // JSON responses are automatically parsed.
        console.log('questionsStore - getLastShortAnswer - response', response);

        if (response.status === 200) {
          this.lastShortAnswer = response.data[0].acf.dateLong_k;
          const storage = new Storage();
          await storage.create();
          await storage.set('lastShortAnswer', response.data[0].acf.dateLong_k);

          // if (response.data[0].acf.dateLong_k) {
          //   // above write if statement to check if 30min over
          //   if (userStore.initialAnswerExist == true) {
          //     userStore.showQuestions = true;
          //   } else {
          //     userStore.showQuestions = false;
          //   }
          // }
          return new Promise((resolve) => {
            // console.log(
            //   'questionsStore - getLastShortAnswer - resolve',
            //   response
            // );
            resolve(response.data[0].acf.dateLong_k);
            // }
          });
        }
      } catch (e) {
        console.log('questionsStore - getLastShortAnswer - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    async countShortAnswers() {
      const userStore = useUserStore();

      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb/?meta_key=uniqueUserId&meta_value=${userStore.uniqueUserId}&per_page=100`
        );

        // JSON responses are automatically parsed.
        console.log('questionsStore - countShortAnswers - response', response);

        if (response) {
          this.totalShortAnswers = response.headers['x-wp-total'];
        }

        this.shortAnswersArray = [];

        for (const post of response.data) {
          const timestamp = Number(post.acf.timestamp_k);
          this.shortAnswersArray.push(timestamp);
        }

        this.calculateTodayShortAnswers();

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('finish');
          // }
        });
      } catch (e) {
        console.log('questionsStore - countShortAnswers - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
  },

  getters: {
    // sheetsShortG: (state) => state.sheetsShort,
    // questionsShortG: (state) => state.questionsShort,
    // batteriesShortG: (state) => state.batteriesShort,
    // scalesShortG: (state) => state.scalesShort,
  },
});
