import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import { toDisplayString } from 'vue';
import dayjs from 'dayjs';

export const useEvaluationStore = defineStore('evaluationStore', {
  state: () => {
    return {
      answersInitial: {},

      answersShort: {},
    };
  },
  actions: {
    async getInitialAnswers() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial`
        );

        console.log('evaluationStore -  response', response);
        if (response.data.length >= 1) {
          for (let [value, key] of Object.entries(response.data)) {
            this.answersInitial[value] = key;
          }

          return new Promise((resolve) => {
            // if (response.status == 200) {
            resolve(response);
            // }
          });
        } else {
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
    },
    async getShortAnswers() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb`
        );

        console.log('evaluationStore -  response', response);
        if (response.data.length >= 1) {
          for (let [value, key] of Object.entries(response.data)) {
            this.answersShort[value] = key;
          }

          return new Promise((resolve) => {
            // if (response.status == 200) {
            resolve(response);
            // }
          });
        } else {
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
    },
  },

  getters: {},
});
