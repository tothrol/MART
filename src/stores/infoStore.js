import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
// import { Storage } from '@ionic/storage';

// import { useQuestionsStore } from '@/stores/questionsStore';

export const useInfoStore = defineStore('infoStore', {
  state: () => {
    return {
      welcomeText: { text: '', title: '' },
      briefingShort: { text: '', title: '' },
      compliance: { text: '', title: '' },
    };
  },
  actions: {
    async getWelcomeText() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/pages?slug=begruessungstext`
        );

        if (response.status == 200) {
          this.welcomeText.text = response.data[0].content.rendered;
          this.welcomeText.title = response.data[0].title.rendered;
          // const storage = new Storage();
          // await storage.create();
          // await storage.set(
          //   'lastShortQuestion',
          //   response.data[0].acf.dateLong_k
          // );
          return new Promise((resolve) => {
            console.log('infoStore - welcome - resolve', response);
            resolve('infoStore - welcome - resolve');
            // }
          });
        }
      } catch (e) {
        console.log('infoStore - welcome - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    async getBriefingShort() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/pages?slug=briefing-kurzfragebogen`
        );

        if (response.status == 200) {
          this.briefingShort.text = response.data[0].content.rendered;
          this.briefingShort.title = response.data[0].title.rendered;
          // const storage = new Storage();
          // await storage.create();
          // await storage.set(
          //   'lastShortQuestion',
          //   response.data[0].acf.dateLong_k
          // );
          return new Promise((resolve) => {
            console.log('infoStore - briefingShort - resolve', response);
            resolve('infoStore - briefingShort - resolve');
            // }
          });
        }
      } catch (e) {
        console.log('infoStore - briefingShort - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
    async getCompliance() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/pages?slug=datenschutzerklaerung`
        );

        if (response.status == 200) {
          this.compliance.text = response.data[0].content.rendered;
          this.compliance.title = response.data[0].title.rendered;
          // const storage = new Storage();
          // await storage.create();
          // await storage.set(
          //   'lastShortQuestion',
          //   response.data[0].acf.dateLong_k
          // );
          return new Promise((resolve) => {
            console.log('infoStore - compliance - resolve', response);
            resolve('infoStore - compliance - resolve');
            // }
          });
        }
      } catch (e) {
        console.log('infoStore - compliance - error', e);
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
