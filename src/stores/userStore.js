import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { Storage } from '@ionic/storage';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useInfoStore } from '@/stores/infoStore';
import { useStatsStore } from '@/stores/statsStore';
import { LocalNotifications } from '@capacitor/local-notifications';
import dayjs from 'dayjs';
import { useRouter, useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
// import router from '../router';

// import { useQuestionsStore } from '@/stores/questionsStore';

export const useUserStore = defineStore('userStore', {
  state: () => {
    return {
      userData: {
        id: 0,
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        token: '',
      },

      // showQuestions: false,
      showDevbox: false,
      showInfoboxHome: false,
      showInfoboxInitial: false,

      showInfoboxShort: false,
      showAdminButtonsHome: false,
      uniqueUserId: '',
      randomArray: [],
      complianceAccepted: false,
      briefingShortChecked: false,
      appMessage: '',
      dailyLoop: null,
      notificationTimes: [],
      notificationTimesRandom: [],
      localNotificationTapped: false,
      startOfThisInterval: 0,
      endOfThisInterval: 0,
      startOfIntervalsRandomNotification: 0,
      conditionInterval: false,
    };
  },
  actions: {
    updateUserData(data) {
      // console.log('store - updateUserData - data', data);

      const userData = {
        id: 0,
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        token: '',
      };
      if (validValue(data.id)) userData.id = data.id;
      if (validValue(data.email)) userData.email = data.email;
      if (validValue(data.username)) userData.username = data.username;
      if (validValue(data.firstname)) userData.firstname = data.firstname;
      if (validValue(data.lastname)) userData.lastname = data.lastname;
      if (validValue(data.token)) userData.token = data.token;

      this.userData = userData;
      if (validValue(data.uniqueUserId)) this.uniqueUserId = data.uniqueUserId;

      // console.log(
      //   'store - updateUserData - this.userData, uniqueUserId',
      //   this.userData,
      //   this.uniqueUserId
      // );
    },
    async logout() {
      this.userData.token = '';

      const storage = new Storage();
      await storage.create();
      await storage.remove('token');

      // this.complianceAccepted = false
      //  questionsStore.initialAnswerExist = false
      // await storage.remove('email');
      // await storage.remove('username');
      // await storage.remove('id');

      // await storage.remove('uniqueUserId');
    },

    async login(username, password, uniqueUserId) {
      console.log(
        'userStore - login - credentials: ',
        username,
        password,
        uniqueUserId
      );
      try {
        const response = await axios.post(
          `https://fuberlin.nvii-dev.com/wp-json/jwt-auth/v1/token`,
          {
            username: username,
            password: password,
          }
        );

        // JSON responses are automatically parsed.
        console.log('userStore - login - response', response);
        if (response.status === 200) {
          this.userData.token = response.data.token;
          this.userData.email = response.data.user_email;
          this.userData.username = response.data.user_display_name;
          this.userData.id = response.data.user_id;

          // this.complianceAccepted = false;
          const storage = new Storage();
          await storage.create();
          await storage.set('token', response.data.token);
          await storage.set('email', response.data.user_email);
          await storage.set('username', response.data.user_display_name);
          await storage.set('id', response.data.user_id);

          const complianceAccepted = await storage.get('complianceAccepted');
          console.log(
            'userStore - login - complianceAccepted',
            complianceAccepted
          );
          if (complianceAccepted == true) {
            this.complianceAccepted = true;
          }

          // this.dailyFunction();

          if (this.uniqueUserId != uniqueUserId) {
            console.log('NewUniqueUserID');
            const infoStore = useInfoStore();
            const storage = new Storage();
            await storage.create();
            await storage.set('uniqueUserId', uniqueUserId);
            this.uniqueUserId = uniqueUserId;

            await storage.remove('randomArray');
            await storage.remove('complianceAccepted');
            await storage.remove('briefingShortChecked');
            await storage.remove('lastShortAnswer');
            await storage.remove('lastShortAnswerMs');
            await storage.remove('nextShortAnswerMs');
            await storage.remove('todayShortAnswers');
            await storage.remove('totalShortAnswers');
            await storage.remove('initialAnswerExist');

            await storage.remove('todayShortAnswersArray');
            await storage.remove('shortAnswersArray');
            await storage.remove('datesAndTimes');
            await this.createRandomArray();
            this.complianceAccepted = false;
            console.log(
              'NewUniqueUserID - this.complianceAccepted',
              this.complianceAccepted
            );
            this.briefingShortChecked = false;
            let questionsStore = useQuestionsStore();
            questionsStore.lastShortAnswer = '';
            questionsStore.lastShortAnswerMs = 0;
            questionsStore.todayShortAnswersArray = [];
            questionsStore.shortAnswersArray = [];
            questionsStore.nextShortAnswerMs = 0;
            questionsStore.todayShortAnswers = 0;
            questionsStore.totalShortAnswers = 0;
            questionsStore.initialAnswerExist = false;
            this.startOfThisInterval = 0;
            this.endOfThisInterval = 0;
            this.startOfIntervalsRandomNotification = 0;
            this.conditionInterval = false;

            infoStore.endDate = {
              string: '',
              jsDate: '',
              dayJs: '',
              ms: '',
            };

            infoStore.startDate = { string: '', jsDate: '', dayJs: '', ms: '' };
            infoStore.dailyStartTime = {
              string: '',
              jsDate: '',
              dayJs: '',
              ms: '',
              todayStartOfDay: '',
              todayStartOfDayMs: '',
              todayStartTime: '',
              todayStartTimeMs: '',
            };
            infoStore.dailyEndTime = {
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
            };

            await this.resetNotifications();
            await questionsStore.getLastShortAnswer();
            await questionsStore.countShortAnswers();
            await infoStore.getOptions();
            await questionsStore.checkIfInitalAnswerExists();
          }
        }
        return new Promise((resolve) => {
          // if (response.status == 200) {
          console.log('userStore - login - resolve');
          resolve(response);
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          console.log('userStore - login - reject', e);

          reject(e);
          // }
        });

        // console.log('userStore - login - e', e);
      }
    },

    async dailyFunction() {
      // this.dailyFunctionLoop;
      // // only works as long the App is in the foreground - when app is in background or closed interval stopps
      // this.dailyLoop = setInterval(this.dailyFunctionLoop, 1000 * 60 * 60 * 24);
    },
    async dailyFunctionLoop() {
      // console.log('userStore - dailyFunctionLoop', dayjs());
      // let statsStore = useStatsStore();
      // const today = dayjs().format('DD.MM.YYYY');
      // const time = dayjs().format('HH:mm');
      // const dateLong = dayjs().format();
      // statsStore.getStats(today, time, dateLong);
    },
    async clearDailyFunction() {
      // clearInterval(this.dailyInerval);
    },

    async validateToken(token) {
      try {
        console.log(`userStore - validateToken - token: ${token}`);

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.post(
          `https://fuberlin.nvii-dev.com/wp-json/jwt-auth/v1/token/validate`,
          {},
          config
        );

        console.log('userStore - validateToken - response: ', response);

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve(response);
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {

          reject(e);
          // }
        });

        // console.log('userStore - login - e', e);
      }
    },

    async atAppStart() {
      // Runs at restart of page / restart of App, but not if app is only in the background and comes back to foreground
      console.log('atAppStart');
      const questionsStore = useQuestionsStore();

      // At Start/Restart of App
      // wird getriggert wenn auf /login zugegriggen wird

      // wird bei jedem refresh/restart ausgeführt:
      const storage = new Storage();
      await storage.create();
      let briefingShortChecked = await storage.get('briefingShortChecked');
      if (briefingShortChecked == true) {
        this.briefingShortChecked = true;
      }
      const complianceAccepted = await storage.get('complianceAccepted');
      console.log('atAppStart - complianceAccepted', complianceAccepted);
      if (complianceAccepted == true) {
        this.complianceAccepted = true;
      }

      let todayShortAnswers = await storage.get('todayShortAnswers');
      if (todayShortAnswers != null) {
        questionsStore.todayShortAnswers = todayShortAnswers;
      }

      let totalShortAnswers = await storage.get('totalShortAnswers');
      if (totalShortAnswers != null) {
        questionsStore.totalShortAnswers = totalShortAnswers;
      }
      let lastShortAnswer = await storage.get('lastShortAnswer');
      if (lastShortAnswer != null) {
        questionsStore.lastShortAnswer = lastShortAnswer;
        // 2check: did not work... need different approach
        //when there for some reason was an answer after 12, than there won't be a reset
        // better calculating it manually by writing date of every answer to array
        const today = dayjs().format('DD.MM.YY');
        const dateOfLastShortAnswer = dayjs(lastShortAnswer).format('DD.MM.YY');
        if (today != dateOfLastShortAnswer) {
          questionsStore.todayShortAnswers = 0;
          await storage.set('todayShortAnswers', 0);
        }
      }
      let lastShortAnswerMs = await storage.get('lastShortAnswerMs');
      if (lastShortAnswerMs != null) {
        questionsStore.lastShortAnswerMs = lastShortAnswerMs;
      }

      let shortAnswersArray = await storage.get('shortAnswersArray');
      if (shortAnswersArray != null) {
        questionsStore.shortAnswersArray = shortAnswersArray;
      }

      let todayShortAnswersArray = await storage.get('todayShortAnswersArray');
      if (todayShortAnswersArray != null) {
        questionsStore.todayShortAnswersArray = todayShortAnswersArray;
      }
      console.log(
        'userStore - atAppStart - todayShortAnswersArray',
        todayShortAnswersArray
      );

      let nextShortAnswerMs = await storage.get('nextShortAnswerMs');
      if (nextShortAnswerMs != null) {
        questionsStore.nextShortAnswerMs = nextShortAnswerMs;
      }

      let randomArray = await storage.get('randomArray');
      if (randomArray != null) {
        this.randomArray = randomArray;
      } else {
        await this.createRandomArray();
      }

      let initialAnswerExist = await storage.get('initialAnswerExist');
      console.log('userStore - Auth - initialAnswerExist', initialAnswerExist);
      if (initialAnswerExist != null) {
        questionsStore.initialAnswerExist = initialAnswerExist;
      } else {
        // when checking here for InitialAnswer than it might get a negative response, as the answer cant be found in WP due to delay, so better not check.
        // questionsStore.checkIfInitalAnswerExists();
      }

      let notificationTimes = await storage.get('notificationTimes');
      if (notificationTimes != null) {
        this.notificationTimes = notificationTimes;
      }

      let notificationTimesRandom = await storage.get(
        'notificationTimesRandom'
      );
      if (notificationTimesRandom != null) {
        this.notificationTimesRandom = notificationTimesRandom;
      }

      const id = await storage.get('id');
      const email = await storage.get('email');
      const username = await storage.get('username');
      const uniqueUserId = await storage.get('uniqueUserId');
      const userData = {
        id: id,
        email: email,
        username: username,
        token: '',
        uniqueUserId: uniqueUserId,
      };
      this.updateUserData(userData);

      const infoStore = useInfoStore();

      // START dateAndTimes
      let datesAndTimes = await storage.get('datesAndTimes');
      if (datesAndTimes != null) {
        infoStore.datesAndTimes = datesAndTimes;
        infoStore.calculateDatesAndTimes(datesAndTimes);
      }
      console.log('userStore - atAppStart - datesAndTimes: ', datesAndTimes);
      // END dateAndTimes

      await infoStore.getOptions();
      // await questionsStore.calculateTodayShortAnswers();
      // END wird bei jedem refresh/restart ausgeführt

      const token = await storage.get('token');

      if (token != null) {
        this.userData.token = token;
        return true;
      } else {
        return false;
      }

      // if (token != null) {
      //   let validateToken = await this.validateToken(token);
      //   console.log('userStore - atAppStart - validateToken', validateToken);
      //   if (validateToken.status === 200) {
      //     this.userData.token = token;
      //     return true;
      //   } else {
      //     return false;
      //   }
      // } else return false;
    },

    async createRandomArray() {
      // Randomize Skala
      try {
        const storage = new Storage();
        await storage.create();
        const randomArray = [];

        // console.log('randomArray rs', rs);

        // console.log('NEW randomArray');

        for (let i = 0; i <= 30; i++) {
          const entry = Math.floor(Math.random() * 100);
          // console.log('NEW randomArray - entry', entry);

          randomArray.push(entry);
        }
        const unique = [...new Set(randomArray)];

        await storage.set('randomArray', unique);
        this.randomArray = unique;

        console.log('randomArray:', randomArray);

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('resolve');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject('reject', e);
          // }
        });
      }

      // END Randomize Skala
    },

    async setTestNotifications() {
      //START channel
      const channel = {
        id: '2',
        name: 'channel2',
        importance: 5,
        sound: 'none.mp3',
      };

      LocalNotifications.createChannel(channel);
      //END channel

      console.log('setNotifiations');
      let notificationArray = [];

      // await this.resetNotifications();

      let now = dayjs();
      let nowPlusOneMinute = dayjs().add(5, 'second').valueOf();

      let notificationEntry = {
        id: 5856,
        channelId: 2,
        title: `Erinnerung Fragebogen`,
        body: `Bitte Fragebogen ausfüllen`,
        schedule: {
          at: new Date(nowPlusOneMinute),
          allowWhileIdle: true,
        },
        foreground: true,
        smallIcon: 'ic_stat_tonne',
        extra: {},
        sound: 'none',
      };
      notificationArray.push(notificationEntry);

      await LocalNotifications.requestPermissions().then(function (result) {
        console.log(
          'Notifiations - setNotifications - requestPermissions - result',
          result
        );
      });

      await LocalNotifications.schedule({
        notifications: notificationArray,
      });

      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (payload) => {
          // Redirect to shortquestions if conditions are right, else go to home
          console.log(
            'Notifiations - setTestNotifications - requestPermissions - addListener',
            payload
          );

          this.localNotificationTapped = true;
          // this.onStartQuestionsShort();
        }
      );
    },

    async setNotifications() {
      try {
        // START RESET
        let notificationTimes = [];
        let notificationTimesRandom = [];
        let notificationArray = [];

        await this.resetNotifications();
        this.notificationArray = [];
        // END RESET

        // START Calculating Notification Times
        let infoStore = useInfoStore();
        let questionsStore = useQuestionsStore();
        let dailyInterval = infoStore.dailyInterval;
        let dailyIntervalMs = dailyInterval * 60 * 60 * 1000;

        let dailyStartTime = infoStore.dailyStartTime;
        let todayStartTimeMs = infoStore.dailyStartTime.todayStartTimeMs;

        let dailyEndTime = infoStore.dailyEndTime;
        let todayEndTimeMs = infoStore.dailyEndTime.todayEndTimeMs;

        let dailyStartTimeHour = dayjs(todayStartTimeMs).hour();
        let dailyEndTimeHour = dayjs(todayEndTimeMs).hour();

        console.log(
          'userStore - setNotifications - dailyStartTimeHour',
          dailyStartTimeHour,
          dailyEndTimeHour
        );

        let breakBetweenShortQuestionsInMin =
          infoStore.breakBetweenShortQuestions;

        let lastShortAnswer = dayjs(questionsStore.lastShortAnswer);
        let lastShortAnswerMs = dayjs(questionsStore.lastShortAnswer).valueOf();
        let lastShortAnswerPlusBreakMs =
          lastShortAnswerMs + breakBetweenShortQuestionsInMin * 60 * 1000;
        console.log(
          'userStore - setNotifications - lastShortAnswer',
          lastShortAnswer
        );
        console.log(
          'userStore - setNotifications - lastShortAnswerPlusBreakMs',
          lastShortAnswerPlusBreakMs
        );
        let nowMs = dayjs().valueOf();

        let secureCounter = 0;

        let newEntry = todayStartTimeMs;
        let newEntryRandom;

        let amountNotifications;

        let platform = Capacitor.getPlatform();
        if (platform == 'web' || platform === 'android') {
          amountNotifications = 100;
        } else {
          amountNotifications = 63;
        }

        for (let i = 0; i <= amountNotifications; ) {
          let randomMinute = Math.floor(Math.random() * dailyInterval * 60);

          let randomMs = randomMinute * 60 * 1000;
          if (secureCounter == 0) {
            newEntry = todayStartTimeMs;
            newEntryRandom = newEntry + randomMs;
          } else {
            newEntry += dailyIntervalMs;
            newEntryRandom = newEntry + randomMs;
          }

          let newEntryHour = dayjs(newEntry).hour();

          if (
            newEntryHour >= dailyStartTimeHour &&
            newEntryHour < dailyEndTimeHour &&
            newEntry > nowMs
          ) {
            console.log('RandomMinute: ', randomMinute);
            if (newEntry < lastShortAnswerPlusBreakMs) {
              // if regular calculated Entry (every 2 Hours) is before the 30min Timer is over, than make the new Entry at the same time the 30min timer is over
              let newEntryPlus = lastShortAnswerPlusBreakMs;
              notificationTimes.push(newEntryPlus);
            } else {
              notificationTimes.push(newEntry);
            }

            let entryToPush;
            if (newEntryRandom < lastShortAnswerPlusBreakMs) {
              // if regular calculated Entry (every 2 Hours) is before the 30min Timer is over, than make the new Entry at the same time the 30min timer is over
              entryToPush = lastShortAnswerPlusBreakMs;
            } else {
              entryToPush = newEntryRandom;
            }
            // START check if todayShortAnswers === 6
            if (questionsStore.todayShortAnswers === 6) {
              // daily limit reached
              let todayDate = dayjs().format('DD.MM.YYYY');
              let entryToPushDate = dayjs(entryToPush).format('DD.MM.YYYY');
              if (todayDate != entryToPushDate) {
                // only add entry if its not today
                console.log('userStore - setNotification - NotToday');
                notificationTimesRandom.push(entryToPush);
              }
            } else {
              notificationTimesRandom.push(entryToPush);
            }
            // END check if todayShortAnswers === 6

            i++;
          }
          secureCounter++;
          if (secureCounter > 1000) {
            return;
          }
        }
        console.log(
          'userStore - setNotifications - notificationTimes',
          notificationTimes
        );

        console.log(
          'userStore - setNotifications - notificationTimesRandom',
          notificationTimesRandom
        );

        this.notificationTimes = notificationTimes;
        this.notificationTimesRandom = notificationTimesRandom;
        const storage = new Storage();
        await storage.create();
        await storage.set('notificationTimes', notificationTimes);
        await storage.set('notificationTimesRandom', notificationTimesRandom);

        // setting nextShortAnswerMs to first array entry
        questionsStore.nextShortAnswerMs = notificationTimesRandom[0];

        await storage.set('nextShortAnswerMs', notificationTimesRandom[0]);

        //END Calculating Notification Times

        //START channel
        const channel = {
          id: '1',
          name: 'channel1',
          importance: 5,
          sound: 'none.mp3',
        };

        LocalNotifications.createChannel(channel);
        //END channel

        console.log('setNotifiations');

        // let now = dayjs();
        // let nowPlusOneMinute = dayjs().add(5, 'second').valueOf();
        console.log(
          'Notifiations - setNotifications - notificationTimes',
          notificationTimes
        );

        for (const [i, notificationTime] of notificationTimesRandom.entries()) {
          // let notificationId = notificationTime - dayjs('2022-01-01').valueOf;
          // // There is a limit on the Id (32bit int), so we start the id at 2022
          let notificationEntry = {
            id: i,
            channelId: 1,
            title: `MART`,
            body: `Bitte Kurzfragebogen ausfüllen!`,
            schedule: {
              at: new Date(notificationTime),
              allowWhileIdle: true,
            },
            foreground: true,
            smallIcon: 'ic_stat_tonne',
            extra: {},
            sound: 'none.mp3',
          };
          notificationArray.push(notificationEntry);
        }

        console.log(
          'Notifiations - setNotifications - notificationArray',
          notificationArray
        );

        let checkPermissions = await LocalNotifications.checkPermissions();

        console.log(
          'Notifiations - setNotifications - checkPermissions',
          checkPermissions
        );

        let result = await LocalNotifications.requestPermissions();

        console.log(
          'Notifiations - setNotifications - requestPermissions - result',
          result
        );

        await LocalNotifications.schedule({
          notifications: notificationArray,
        });

        // const router = useRouter();

        // START get pending Notifications
        let pendingNotifications = await LocalNotifications.getPending();
        console.log(
          'Notifiations - pendingNotifications',
          pendingNotifications
        );
        infoStore.pendingNotificationsCount =
          pendingNotifications.notifications.length;

        // END get pending Notifications

        await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (payload) => {
            // Redirect to shortquestions if conditions are right, else go to home
            console.log(
              'Notifiations - setNotifications - requestPermissions - addListener',
              payload
            );
            this.localNotificationTapped = true;
            // this.onStartQuestionsShort();
          }
        );
        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve('resolve setNotification');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject('reject setNotification', e);
          // }
        });
      }
    },
    async getPendingNotifications() {
      let infoStore = useInfoStore();
      // START get pending Notifications
      let pendingNotifications = await LocalNotifications.getPending();
      console.log('Notifiations - pendingNotifications', pendingNotifications);
      infoStore.pendingNotificationsCount =
        pendingNotifications.notifications.length;

      // END get pending Notifications
    },
    async resetNotifications() {
      try {
        // var id;
        let idsArray = [];
        let result = await LocalNotifications.getPending();
        console.log(
          'userStore - resetNotifications - getPending - result',
          result
        );

        //here a for each loop of all result notifications
        if (
          result.notifications != undefined &&
          result.notifications.length() > 0
        ) {
          for (let [count] of Object.entries(result.notifications)) {
            let notification = result.notifications[count];

            idsArray.push(notification.id);
          }
        }

        // id = result.notifications[0].id.toString();

        console.log('userStore - resetNotifications - -id', idsArray);

        if (idsArray.length != 0) {
          for (var [noteCount] of Object.entries(idsArray)) {
            let noteId = idsArray[noteCount];

            await LocalNotifications.cancel({
              notifications: [{ id: noteId }],
            });
          }
        }
        let infoStore = useInfoStore();
        infoStore.localNotificationsCount = 'reset';

        const storage = new Storage();
        await storage.create();
        await storage.remove('notificationTimes');
        await storage.remove('notificationTimesRandom');
        this.notificationTimes = [];
        this.notificationTimesRandom = [];

        return new Promise((resolve) => {
          // if (response.status == 200) {
          console.log('userStore - resetNotifications - resolve');
          resolve('resolve setNotification');
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {
          reject('reject setNotification', e);
          // }
        });
      }
    },
  },
  getters: {
    getUserData: (state) => state.userData,
  },
});
