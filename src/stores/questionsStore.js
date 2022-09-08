import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { toDisplayString } from 'vue';
import dayjs from 'dayjs';

export const useQuestionsStore = defineStore('questionsStore', {
  state: () => {
    return {
      questionsInitial: {},

      batteriesInitial: {},
      scalesInitial: {},

      questionsShort: {},
      batteriesShort: {},
      scalesShort: {},
    };
  },
  actions: {
    getInitialQuestions() {
      axios
        .get(`https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen`)
        .then((response) => {
          // JSON responses are automatically parsed.

          const questions = response.data[0].acf.questionsRepeater;
          const batteries = response.data[0].acf.batteries;
          const scales = response.data[0].acf.scalesRepeater;

          for (const question of questions) {
            this.questionsInitial[question.itemId] = question;
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
      // try {
      this.showSpinner = true;
      console.log('questionsStore - sendInitialAnswers - answers', answers);

      const userStore = useUserStore();
      console.log(
        'questionsStore - sendInitialAnswers - answers - user',
        userStore.userData
      );
      let token = userStore.userData.token;

      let answersString = JSON.stringify(answers);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      let today = dayjs().format('DD.MM.YYYY');
      let now = dayjs().format('HH:mm');
      let dateLong = dayjs().format();

      const body = {
        acf: {
          userId: userStore.userData.id,
          userName: userStore.userData.username,
          date: today,
          time: now,
          answers: answersString,
          dateLong: dateLong,
        },
        slug: `${userStore.userData.username}_${today}_${now}`,
        title: `${userStore.userData.username}_${today}_${now}`,
        status: 'publish',
      };

      let response = await axios.post(
        `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial`,
        body,
        config
      );

      // JSON responses are automatically parsed.

      console.log('questionsStore - sendInitialAnswers - response', response);

      return response;

      // new Promise((resolve) => {
      //   if (response.status == 201) {
      //     return resolve(response);
      //   }
      // });
      // } catch (e) {
      //   new Promise((reject) => {
      //     // if (response.status == 200) {

      //     return reject(e);
      //     // }
      //   });
      // }
    },
    async checkIfInitalAnswerExists() {
      const userStore = useUserStore();
      console.log(
        'questionsStore - checkIfInitalAnswersExists - userID',
        userStore.userData.id
      );
      if (userStore.userData.id != 0 && userStore.userData.id != '') {
        try {
          const response = await axios.get(
            `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial?author=${userStore.userData.id}`
          );

          console.log(
            'questionsStore - checkIfInitalAnswersExists - response',
            response
          );
          if (response.data.length >= 1) {
            userStore.showInitial = false;
            console.log(
              'questionsStore - checkIfInitalAnswersExists - DOES EXIST -  userStore.showInitial',
              userStore.showInitial
            );

            return new Promise((resolve) => {
              // if (response.status == 200) {
              resolve(response);
              // }
            });
          } else {
            userStore.showInitial = true;
            console.log(
              'questionsStore - checkIfInitalAnswersExists - DOES NOT Exist - userStore.showInitial',
              userStore.showInitial
            );
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

          const questions = response.data[0].acf.questionRepeater_k;
          const batteries = response.data[0].acf.batteries_k;
          const scales = response.data[0].acf.scalesRepeater_k;

          for (const question of questions) {
            this.questionsShort[question.itemId_k] = {
              batteryId: question.batteryId_k,
              choiceId: question.choiceId_k,
              itemId: question.itemId_k,
              item: question.item_k,
              scaleId: question.skaleId_k,
            };
          }
          for (const battery of batteries) {
            this.batteriesShort[battery.batteryId_k] = {
              batteryId: battery.batteryId_k,
              batteryName: battery.batteryName_k,
              batteryText: battery.batteryText_k,
            };
          }
          for (const scale of scales) {
            let scaleRep = [];
            for (let [index, repeater] of Object.entries(
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
            };
          }

          console.log(
            'questionsStore - getShortQuestions - response',
            response
          );

          return;
        })
        .catch((e) => {
          console.log('questionsStore - getShortQuestions - error', e);
          return e;
        });
    },
    async sendShortAnswers(answers) {
      // try {
      this.showSpinner = true;
      console.log('questionsStore - sendShortAnswers - answers', answers);
      const userStore = useUserStore();
      let token = userStore.userData.token;

      let answersString = JSON.stringify(answers);

      let today = dayjs().format('DD.MM.YYYY');
      let now = dayjs().format('HH:mm');
      let dateLong = dayjs().format();
      console.log('DateLong', dateLong);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const body = {
        acf: {
          userId_k: userStore.userData.id,
          answers_k: answersString,
          userId: userStore.userData.id,
          userName_k: userStore.userData.username,
          date_k: today,
          time_k: now,
          dateLong_k: dateLong,
        },
        slug: `${userStore.userData.username}_${today}_${now}`,
        title: `${userStore.userData.username}_${today}_${now}`,
        status: 'publish',
      };

      let response = await axios.post(
        `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb`,
        body,
        config
      );

      // JSON responses are automatically parsed.

      console.log('questionsStore - sendShortAnswers - response', response);

      return response;
    },
  },

  getters: {},
});
