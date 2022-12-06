import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// import { Storage } from '@ionic/storage';

// import { useQuestionsStore } from '@/stores/questionsStore';

export const useInfoStore = defineStore('infoStore', {
  state: () => {
    return {
      welcomeText: { text: '', title: '' },
      briefingShort: { text: '', title: '' },
      briefingShortMenu: { text: '', title: '' },
      compliance: { text: '', title: '' },
      startDate: { string: '', jsDate: '', dayJs: '', ms: '' },
      endDate: { string: '', jsDate: '', dayJs: '', ms: '' },
      dailyStartTime: {
        string: '',
        jsDate: '',
        dayJs: '',
        ms: '',
        todayStartOfDay: '',
        todayStartOfDayMs: '',
        todayStartTime: '',
        todayStartTimeMs: '',
      },
      dailyEndTime: {
        string: '',
        jsDate: '',
        dayJs: '',
        ms: '',
        todayStartOfDay: '',
        todayStartOfDayMs: '',
        todayStartTime: '',
        todayStartTimeMs: '',
      },
      testCounter: 0,
    };
  },
  actions: {
    getOptionsLoop() {
      console.log('infoStore - getOptionsLoop');
      this.getOptions();
      setInterval(this.getOptions, 60000);
    },
    async getOptions() {
      try {
        this.testCounter++;
        // url below works only with the plugin ACF to REST-API
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/acf/v2/options/`
        );

        console.log('infoStore - getOptions - response', response);
        dayjs.extend(customParseFormat);

        if (response.status == 200) {
          // console.log('infoStore - getOptions - response', response);

          //  Date
          this.startDate.string = response.data.acf.startDate;
          this.startDate.jsDate = dayjs(
            response.data.acf.startDate,
            'DD.MM.YYYY',
            true
          ).toDate();
          this.startDate.dayJs = dayjs(
            response.data.acf.startDate,
            'DD.MM.YYYY',
            true
          );
          this.startDate.ms = dayjs(
            response.data.acf.startDate,
            'DD.MM.YYYY',
            true
          ).valueOf();

          this.endDate.string = response.data.acf.endDate;
          this.endDate.jsDate = dayjs(
            response.data.acf.endDate,
            'DD.MM.YYYY',
            true
          ).toDate();
          this.endDate.dayJs = dayjs(
            response.data.acf.endDate,
            'DD.MM.YYYY',
            true
          );
          this.endDate.ms = dayjs(
            response.data.acf.endDate,
            'DD.MM.YYYY',
            true
          ).valueOf();

          //  ENd Date

          //  Time
          // let now = dayjs().valueOf();

          let todayStartOfDay = dayjs().startOf('day');

          // start
          let startTimeString = response.data.acf.dailyStartTime2;
          this.dailyStartTime.string = startTimeString;

          let startTimeHours = startTimeString.slice(0, 2);
          let startTimeMinutes = startTimeString.slice(3, 5);
          let todayStartTime = dayjs()
            .startOf('day')
            .minute(startTimeMinutes)
            .hour(startTimeHours);

          this.dailyStartTime.todayStartOfDay = todayStartOfDay;
          this.dailyStartTime.todayStartOfDayMs = todayStartOfDay.valueOf();
          this.dailyStartTime.todayStartTimeMs = todayStartTime.valueOf();
          this.dailyStartTime.todayStartTime = todayStartTime;
          // END start

          // end
          let endTimeString = response.data.acf.dailyEndTime;
          this.dailyEndTime.string = endTimeString;

          let endTimeHours = endTimeString.slice(0, 2);
          let endTimeMinutes = endTimeString.slice(3, 5);
          let todayEndTime = dayjs()
            .startOf('day')
            .minute(endTimeMinutes)
            .hour(endTimeHours);

          this.dailyEndTime.todayStartOfDay = todayStartOfDay;
          this.dailyEndTime.todayStartOfDayMs = todayStartOfDay.valueOf();
          this.dailyEndTime.todayEndTimeMs = todayEndTime.valueOf();
          this.dailyEndTime.todayEndTime = todayEndTime;

          // END end
          //  ENd daily Time
        }

        return new Promise((resolve) => {
          console.log('infoStore - welcome - resolve', response);
          resolve('infoStore - welcome - resolve');
          // }
        });
      } catch (e) {
        console.log('infoStore - welcome - error', e);
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject(e);
          // }
        });
      }
    },
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
    async getBriefingShortMenu() {
      try {
        const response = await axios.get(
          `https://fuberlin.nvii-dev.com/wp-json/wp/v2/pages?slug=briefing-kurzfragebogen-menu`
        );

        if (response.status == 200) {
          this.briefingShortMenu.text = response.data[0].content.rendered;
          this.briefingShortMenu.title = response.data[0].title.rendered;
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
