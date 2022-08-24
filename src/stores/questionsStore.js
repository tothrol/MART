import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';

export const useQuestionsStore = defineStore('questionsStore', {
  state: () => {
    return {
      questionsInitial: {},

      batteriesInitial: {},
      scalesInitial: {},
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
      let token = userStore.userData.token;

      let answersString = JSON.stringify(answers);

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const body = {
        acf: { userId: userStore.userData.id, answers: answersString },
        slug: 'TT',
        title: 'ttt',
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
  },

  getters: {},
});
