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
    sendInitialAnswers(answers) {
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
      };

      axios
        .post(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial`,
          body,
          config
        )
        .then((response) => {
          // JSON responses are automatically parsed.

          console.log(
            'questionsStore - sendInitialAnswers - response',
            response
          );

          return;
        })
        .catch((e) => {
          return e;
        });
    },
  },

  getters: {},
});
