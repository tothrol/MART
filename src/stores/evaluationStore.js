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

      statistics: {},

      deviceInfos: {},

      totalPages: {
        statistics: null,
        deviceInfos: null,
        answersShort: null,
        answersInitial: null,
      },
      totalPosts: {
        statistics: null,
        deviceInfos: null,
        answersShort: null,
        answersInitial: null,
      },
    };
  },
  actions: {
    async getStatistics(
      getAll,
      perPageInput,
      pageInput,
      offsetInput,
      useOffset,
      postType
    ) {
      console.log(
        'evaluationStore -  getStatistics -parameters',
        getAll,
        perPageInput,
        pageInput,
        offsetInput,
        useOffset,
        postType
      );
      try {
        this.statistics = {};

        console.log('evaluationStore -  getAll', getAll);

        let perPage;
        let page;

        if (getAll === true) {
          page = 1;
          perPage = perPageInput;
        } else {
          perPage = perPageInput;
          page = pageInput;
        }

        let totalPages;
        let totalPosts;
        let lastPage = false;

        let response;
        let statistics = {};
        let postTypeJS;
        if (postType === 'nutzungsstatistik') {
          postTypeJS = 'statistics';
        } else if (postType === 'device-infos') {
          postTypeJS = 'deviceInfos';
        } else if (postType === 'antworten_initial') {
          postTypeJS = 'answersInitial';
        } else if (postType === 'antworten_kurzfrageb') {
          postTypeJS = 'answersShort';
        }

        while (lastPage === false) {
          let url;
          if (useOffset) {
            url = `https://fuberlin.nvii-dev.com/wp-json/wp/v2/${postType}?per_page=${perPage}&offset=${offsetInput}`;
          } else {
            url = `https://fuberlin.nvii-dev.com/wp-json/wp/v2/${postType}?per_page=${perPage}&page=${page}`;
          }
          response = await axios.get(url);

          let responseHeaders = response.headers;
          totalPosts = responseHeaders['x-wp-total'];
          totalPages = parseInt(responseHeaders['x-wp-totalpages']);

          this.totalPages[postTypeJS] = totalPages;
          this.totalPosts[postTypeJS] = totalPosts;

          // console.log('evaluationStore - getStatistics -  response', response);
          // console.log(
          //   'evaluationStore - getStatistics -  page',
          //   page,
          //   '/',
          //   totalPages
          // );

          for (let [value, key] of Object.entries(response.data)) {
            // console.log(
            //   'evaluationStore - getStatistics -  value , key',
            //   value,
            //   key
            // );
            statistics[key.id] = key;
          }

          if (totalPages === page || totalPages === 0 || getAll != true) {
            // if getAll is not true than the loop should only run once
            // console.log('evaluationStore -  LastPAge');
            lastPage = true;
          } else {
            page++;
          }
        }
        this[postTypeJS] = statistics;
        // console.log(
        //   'evaluationStore - getStatistics -  response headers totalPosts',
        //   totalPosts
        // );
        // console.log(
        //   'evaluationStore - getStatistics -  response headers totalPages',
        //   totalPages
        // );

        // console.log('evaluationStore - getStatistics -  response', response);
        if (response) {
          return new Promise((resolve) => {
            resolve(response);
          });
        }
      } catch (e) {
        return new Promise((reject) => {
          reject(e);
        });
      }
    },
  },

  getters: {},
});
