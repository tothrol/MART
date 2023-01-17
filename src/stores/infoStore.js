import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { toRaw } from 'vue';
import { Storage } from '@ionic/storage';
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
        hours: 0,
        minutes: 0,
        jsDate: '',
        dayJs: '',
        ms: '',
        todayStartOfDay: '',
        todayStartOfDayMs: '',
        todayStartTime: '',
        todayStartTimeMs: '',
      },
      dailyInterval: 0,
      breakBetweenShortQuestions: 0,
      datesAndTimes: {},

      testCounter: 0,
      timeframe: false,
      dailyTime: false,

      timeframeMessage: '',
      dailyTimeMessage: '',

      countdownDays: null,
      countdownHours: null,
      countdownMinutes: null,

      secToNext: 0,
      minutesCounter: 0,

      conditionsQuestionsShort: false,
      // needet to trigger computed function timeframe at app Start
      appStateChangeCounter: 0,
      countdownTimerCounter: 0,
      pendingNotificationsCount: 'initial',
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

        console.log('infoStore - getOptions - response xcx', response);
        dayjs.extend(customParseFormat);

        if (response.status == 200) {
          // console.log('infoStore - getOptions - response', response);
          const storage = new Storage();

          let startDate = response.data.acf.startDate;
          let endDate = response.data.acf.endDate;
          let dailyStartTime = response.data.acf.dailyStartTime2;
          let dailyEndTime = response.data.acf.dailyEndTime;
          let dailyInterval = response.data.acf.dailyInterval.intervalTime;
          let breakBetweenShortQuestions = Number(
            response.data.acf.dailyInterval.breakBetweenShortQuestions
          );

          let datesAndTimes = {
            startDate,
            endDate,
            dailyStartTime,
            dailyEndTime,
            dailyInterval,
            breakBetweenShortQuestions,
          };
          await storage.create();
          await storage.set('datesAndTimes', datesAndTimes);

          // END breakBetweenShortQuestions
          this.datesAndTimes = datesAndTimes;

          this.calculateDatesAndTimes(datesAndTimes);
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

    calculateDatesAndTimes(datesAndTimes) {
      const {
        startDate,
        endDate,
        dailyStartTime,
        dailyEndTime,
        dailyInterval,
        breakBetweenShortQuestions,
      } = datesAndTimes;

      dayjs.extend(customParseFormat);

      console.log('infoStore - calcDates - datesAndTimes: ', datesAndTimes);
      // START startDate
      this.startDate.string = startDate;
      this.startDate.jsDate = dayjs(startDate, 'DD.MM.YYYY', true).toDate();
      this.startDate.dayJs = dayjs(startDate, 'DD.MM.YYYY', true);
      this.startDate.ms = dayjs(startDate, 'DD.MM.YYYY', true).valueOf();

      // END startDate

      // START endDate
      this.endDate.string = endDate;
      let endDateDayJs = dayjs(endDate, 'DD.MM.YYYY', true);
      this.endDate.dayJs = endDateDayJs;
      this.endDate.jsDate = endDateDayJs.toDate();
      this.endDate.ms = endDateDayJs.valueOf();
      console.log(
        'infoStore - calculateDatesAndTimes - this.endDate',
        JSON.stringify(toRaw(this.endDate))
      );
      console.log(
        'infoStore - calculateDatesAndTimes - this.endDate.ms',
        toRaw(this.endDate.ms)
      );
      // END endDate

      // START startTime

      // 2check... does this needs to run every day?
      let todayStartOfDay = dayjs().startOf('day');

      let startTimeString = dailyStartTime;
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
      // END startTime

      // START endTime
      let endTimeString = dailyEndTime;
      this.dailyEndTime.string = endTimeString;

      let endTimeHours = endTimeString.slice(0, 2);
      this.dailyEndTime.hours = endTimeHours;

      let endTimeMinutes = endTimeString.slice(3, 5);
      this.dailyEndTime.minutes = endTimeMinutes;
      this.dailyEndTime.string = endTimeString;
      let todayEndTime = dayjs()
        .startOf('day')
        .minute(endTimeMinutes)
        .hour(endTimeHours);

      this.dailyEndTime.todayStartOfDay = todayStartOfDay;
      this.dailyEndTime.todayStartOfDayMs = todayStartOfDay.valueOf();
      this.dailyEndTime.todayEndTimeMs = todayEndTime.valueOf();
      this.dailyEndTime.todayEndTime = todayEndTime;
      // END endTime

      // START dailyInterval
      this.dailyInterval = Number(dailyInterval);
      // END dailyInterval

      // START breakBetweenShortQuestions
      this.breakBetweenShortQuestions = breakBetweenShortQuestions;
      // END breakBetweenShortQuestions
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
