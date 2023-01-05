import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import { useUserStore } from '@/stores/userStore';
import { useStatsStore } from '@/stores/statsStore';
import axios from 'axios';
import { toDisplayString } from 'vue';
import dayjs from 'dayjs';
import { Storage } from '@ionic/storage';
import { useInfoStore } from '@/stores/infoStore';
import { Device } from '@capacitor/device';

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
      timerShortQuestionsRuns: false,

      lastShortAnswer: '',
      lastShortAnswerMs: 0,
      nextShortAnswerMs: 0,

      todayShortAnswers: 0,
      totalShortAnswers: 0,
    };
  },
  actions: {
    getInitialQuestions() {
      axios
        .get(`https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen`)
        .then((response) => {
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

          return;
        })
        .catch((e) => {
          return e;
        });
    },
    async sendInitialAnswers(answers) {
      try {
        const deviceUuid = await Device.getId();
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
            deviceUuid: deviceUuid.uuid,
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
        } else {
          // Error handling here
          // console.log('questionsStore - sendInitialAnswers - response = NOT 201');
        }

        const statsStore = useStatsStore();

        await statsStore.getStats(today, time, dateLong);

        await statsStore.sendDeviceInfos(today, time, dateLong);

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
    async checkIfInitalAnswerExists() {
      const userStore = useUserStore();
      const storage = new Storage();
      await storage.create();
      // console.log(
      //   'questionsStore - checkIfInitalAnswersExists - userID',
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

          // console.log(
          //   'questionsStore - checkIfInitalAnswersExists - response',
          //   response
          // );
          if (response.data.length >= 1) {
            userStore.initialAnswerExist = true;

            await storage.set('initialAnswerExist', true);
            // userStore.showQuestions = true;

            return new Promise((resolve) => {
              // if (response.status == 200) {
              resolve(response);
              // }
            });
          } else {
            userStore.initialAnswerExist = false;
            await storage.set('initialAnswerExist', false);

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
    getShortQuestions() {
      axios
        .get(`https://fuberlin.nvii-dev.com/wp-json/wp/v2/kurzfragebogen`)
        .then((response) => {
          // JSON responses are automatically parsed.
          console.log(
            'questionsStore - getShortQuestions - response',
            response
          );

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

          return;
        })
        .catch((e) => {
          // console.log('questionsStore - getShortQuestions - error', e);
          return e;
        });
    },
    async sendShortAnswers(answers) {
      try {
        const deviceUuid = await Device.getId();
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
            deviceUuid_k: deviceUuid.uuid,
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
          this.todayShortAnswers++;
          await storage.set('todayShortAnswers', this.todayShortAnswers);
          this.totalShortAnswers++;
          await storage.set('totalShortAnswers', this.totalShortAnswers);

          let setNotifications = await userStore.setNotifications();
          console.log(
            'questionsStore - sendShortAnswer - end201 -',
            setNotifications
          );
        }
        // await this.countShortAnswers();

        const statsStore = useStatsStore();

        await statsStore.getStats(today, time, dateLong);

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

        let counter = 0;

        const today = dayjs().format('DD.MM.YY');

        for (const post of response.data) {
          const postDay = dayjs(post.acf.dateLong_k).format('DD.MM.YY');

          if (today === postDay) {
            counter++;
          }
        }

        this.todayShortAnswers = counter;

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve(counter);
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
