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
      this.answersInitial = {};
      let perPage = 100;
      let page = 1;
      let totalPages = 1;
      let totalPosts = 1;
      let lastPage = false;
      try {
        let response;
        while (lastPage === false) {
          const response = await axios.get(
            `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_initial?per_page=${perPage}&page=${page}`
          );

          let responseHeaders = response.headers;
          totalPosts = responseHeaders['x-wp-total'];
          totalPages = parseInt(responseHeaders['x-wp-totalpages']);

          for (let [value, key] of Object.entries(response.data)) {
            console.log(
              'evaluationStore - answersInitial-  value , key',
              value,
              key
            );
            this.answersInitial[key.id] = key;
          }

          if (totalPages === page || totalPages === 0) {
            console.log('evaluationStore - answersInitial-  LastPAge');
            lastPage = true;
          } else {
            page++;
          }
        }

        if (response.data.length >= 1) {
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
      this.answersShort = {};
      console.log('evaluationStore -  getShortAnswers', this.answersShort);
      let perPage = 100;
      let page = 1;
      let totalPages = 1;
      let totalPosts = 1;
      let lastPage = false;
      try {
        let response;
        while (lastPage === false) {
          response = await axios.get(
            `https://fuberlin.nvii-dev.com/wp-json/wp/v2/antworten_kurzfrageb?per_page=${perPage}&page=${page}`
          );

          let responseHeaders = response.headers;
          totalPosts = responseHeaders['x-wp-total'];
          totalPages = parseInt(responseHeaders['x-wp-totalpages']);

          console.log('evaluationStore -  response', response);
          console.log('evaluationStore -  page', page, '/', totalPages);

          for (let [value, key] of Object.entries(response.data)) {
            console.log('evaluationStore -  value , key', value, key);
            this.answersShort[key.id] = key;
          }

          if (totalPages === page || totalPages === 0) {
            console.log('evaluationStore -  LastPAge');
            lastPage = true;
          } else {
            page++;
          }
        }
        console.log(
          'evaluationStore -  response headers totalPosts',
          totalPosts
        );
        console.log(
          'evaluationStore -  response headers totalPages',
          totalPages
        );

        console.log('evaluationStore -  response', response);
        if (response) {
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
