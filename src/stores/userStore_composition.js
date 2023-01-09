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
import { ref } from 'vue';

// import { useQuestionsStore } from '@/stores/questionsStore';

export const useUserStore = defineStore('userStore', () => {
  // const router = useRouter();
  // console.log('userStore - router', router);

  const userData = ref({
    id: 0,
    email: '',
    username: '',
    firstname: '',
    lastname: '',
    token: '',
  });

  // showQuestions: false,
  const showDevbox = ref(false);
  const uniqueUserId = ref('');
  const randomArray = ref([]);
  const complianceAccepted = ref(false);
  const briefingShortChecked = ref(false);
  const appMessage = ref('');
  const dailyLoop = ref(null);
  const notificationTimes = ref([]);

  function updateUserData(data) {
    // console.log('store - updateUserData - data', data);

    const userDataL = {
      id: 0,
      email: '',
      username: '',
      firstname: '',
      lastname: '',
      token: '',
    };
    if (validValue(data.id)) userDataL.id = data.id;
    if (validValue(data.email)) userDataL.email = data.email;
    if (validValue(data.username)) userDataL.username = data.username;
    if (validValue(data.firstname)) userDataL.firstname = data.firstname;
    if (validValue(data.lastname)) userDataL.lastname = data.lastname;
    if (validValue(data.token)) userDataL.token = data.token;

    userData.value = userDataL;
    if (validValue(data.uniqueUserId)) uniqueUserId.value = data.uniqueUserId;

    // console.log(
    //   'store - updateUserData - this.userData, uniqueUserId',
    //   this.userData,
    //   this.uniqueUserId
    // );
  }

  async function logout() {
    userData.value.token = '';

    const storage = new Storage();
    await storage.create();
    await storage.remove('token');
    // await storage.remove('email');
    // await storage.remove('username');
    // await storage.remove('id');

    // await storage.remove('uniqueUserId');
  }

  async function login(username, password, uniqueUserIdL) {
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
        userData.value.token = response.data.token;
        userData.value.email = response.data.user_email;
        userData.value.username = response.data.user_display_name;
        userData.value.id = response.data.user_id;

        // this.complianceAccepted = false;
        const storage = new Storage();
        await storage.create();
        await storage.set('token', response.data.token);
        await storage.set('email', response.data.user_email);
        await storage.set('username', response.data.user_display_name);
        await storage.set('id', response.data.user_id);

        const complianceAccept = await storage.get('complianceAccepted');
        console.log('userStore - login - complianceAccepted', complianceAccept);
        if (complianceAccept == true) {
          complianceAccepted.value = true;
        }

        dailyFunction();

        if (uniqueUserId.value != uniqueUserIdL) {
          console.log('NewUniqueUserID');
          const storage = new Storage();
          await storage.create();
          await storage.set('uniqueUserId', uniqueUserIdL);
          uniqueUserId.value = uniqueUserIdL;

          await storage.remove('randomArray');
          await storage.remove('complianceAccepted');
          await storage.remove('briefingShortChecked');
          await storage.remove('lastShortAnswer');
          await storage.remove('lastShortAnswerMs');
          await storage.remove('nextShortAnswerMs');
          await storage.remove('todayShortAnswers');
          await storage.remove('totalShortAnswers');
          await storage.remove('initialAnswerExist');
          await storage.remove('notificationTimes');
          createRandomArray();
          complianceAccepted.value = false;
          console.log(
            'NewUniqueUserID - this.complianceAccepted',
            complianceAccepted.value
          );
          briefingShortChecked.value = false;
          let questionsStore = useQuestionsStore();
          questionsStore.lastShortAnswer = '';
          questionsStore.lastShortAnswerMs = 0;
          questionsStore.nextShortAnswerMs = 0;
          questionsStore.todayShortAnswers = 0;
          questionsStore.totalShortAnswers = 0;
          questionsStore.initialAnswerExist = false;

          questionsStore.getLastShortAnswer();
          questionsStore.countShortAnswers();
          // questionsStore.checkIfInitalAnswerExists();

          notificationTimes.value = [];
        }
      }
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
  }

  async function dailyFunction() {
    dailyFunctionLoop();
    // only works as long the App is in the foreground - when app is in background or closed interval stopps
    dailyLoop.value = setInterval(dailyFunctionLoop(), 1000 * 60 * 60 * 24);
  }

  async function dailyFunctionLoop() {
    console.log('userStore - dailyFunctionLoop', dayjs());
    let statsStore = useStatsStore();

    const today = dayjs().format('DD.MM.YYYY');
    const time = dayjs().format('HH:mm');
    const dateLong = dayjs().format();
    statsStore.getStats(today, time, dateLong);
  }

  async function clearDailyFunction() {
    clearInterval(dailyLoop.value);
  }

  async function validateToken() {
    try {
      const token = userData.value.token;

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
  }

  async function atAppStart() {
    // Runs at restart of page / restart of App
    console.log('atAppStart');
    // At Start/Restart of App
    // wird getriggert wenn auf /login zugegriggen wird

    // wird bei jedem refresh/restart ausgeführt:
    const storage = new Storage();
    await storage.create();
    let briefingShortCheckedL = await storage.get('briefingShortChecked');
    if (briefingShortCheckedL == true) {
      briefingShortChecked.value = true;
    }
    const complianceAcceptL = await storage.get('complianceAccepted');
    console.log('atAppStart - complianceAccepted', complianceAcceptL);
    if (complianceAcceptL == true) {
      complianceAccepted.value = true;
    }
    const questionsStore = useQuestionsStore();

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
      // check if lastShortAnswer is from today to reset todayShortAnswers

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

    let nextShortAnswerMs = await storage.get('nextShortAnswerMs');
    if (nextShortAnswerMs != null) {
      questionsStore.nextShortAnswerMs = nextShortAnswerMs;
    }

    let randomArrayL = await storage.get('randomArray');
    if (randomArrayL != null) {
      randomArray.value = randomArrayL;
    } else {
      createRandomArray();
    }

    let initialAnswerExist = await storage.get('initialAnswerExist');
    console.log('userStore - Auth - initialAnswerExist', initialAnswerExist);
    if (initialAnswerExist != null) {
      questionsStore.initialAnswerExist = initialAnswerExist;
    } else {
      // when checking here for InitialAnswer than it might get a negative response, as the answer cant be found in WP due to delay, so better not check.
      // questionsStore.checkIfInitalAnswerExists();
    }

    let notificationTimesL = await storage.get('notificationTimes');
    if (notificationTimesL != null) {
      notificationTimes.value = notificationTimesL;
    }

    const id = await storage.get('id');
    const email = await storage.get('email');
    const username = await storage.get('username');
    const uniqueUserId = await storage.get('uniqueUserId');
    const userDataL = {
      id: id,
      email: email,
      username: username,
      token: '',
      uniqueUserId: uniqueUserId,
    };
    updateUserData(userDataL);

    const infoStore = useInfoStore();

    infoStore.getOptionsLoop();
    // END wird bei jedem refresh/restart ausgeführt

    const tokenL = await storage.get('token');
    if (tokenL != null) {
      // Wird nur ausgeführt wenn ein Token vorhanden ist
      userData.value.token = tokenL;
      return true;
    } else return false;
  }

  async function createRandomArray() {
    // Randomize Skala

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
    randomArray.value = unique;

    console.log('randomArray:', randomArray);

    // END Randomize Skala
  }

  async function onStartQuestionsShort() {
    // const router = useRouter();
    let questionsStore = useQuestionsStore();
    // check for validToken
    let answer = await validateToken();
    console.log('userStore await validateToken - answer', answer);
    if (answer.code === 'ERR_NETWORK') {
      appMessage.value =
        'Bitte stellen Sie sicher das eine Internetverbindung besteht! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';
      return;
    } else if (answer.status != 200 && answer.status != 201) {
      appMessage.value =
        'Bitte melden Sie sich erneut an! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';

      // router.push('/login');
      return;
    }

    // end check for validToken

    if (briefingShortChecked.value === false) {
      // router.push('/briefing-short');
    } else if (
      complianceAccepted.value === true &&
      questionsStore.initialAnswerExist === true &&
      questionsStore.todayShortAnswers < 6
      // timeframe &&
      // dailyTime &&
      // secToNext <= 1
    ) {
      console.log('onStartQuestionsShort - push - questionsShort');
      // router.push('/questionsshort');
    } else {
      console.log('onStartQuestionsShort - push - questionsShort');
      // router.push('/home');
    }
  }

  async function setTestNotifications() {
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

    await resetNotifications();

    let now = dayjs();
    let nowPlusOneMinute = dayjs().add(5, 'second').valueOf();

    let notificationEntry = {
      id: 5856,
      channelId: 2,
      title: `Erinnerung Fragebogen`,
      body: `Bitte Fragebogen ausfüllen`,
      schedule: {
        at: new Date(nowPlusOneMinute),
        allowWhileIdle: false,
      },
      foreground: false,
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
        appMessage.value = 'message';
        // const router = useRouter();

        // eslint-disable-next-line no-undef
        router.replace('/user');
        // this.onStartQuestionsShort();
      }
    );
  }

  function testRouter() {
    // const router = useRouter();
    console.log('testRoute');
    this.router.currentRoute.value.path;
    // const router = useRouter();
    // eslint-disable-next-line no-undef
    this.router.push('/user');
  }

  async function setNotifications() {
    try {
      // START Calculating Notification Times
      let infoStore = useInfoStore();
      let questionsStore = useQuestionsStore();
      let dailyInterval = infoStore.dailyInterval;
      let dailyIntervalMs = dailyInterval * 60 * 60 * 1000;

      let dailyStartTime = infoStore.dailyStartTime;
      let todayStartTimeMs = infoStore.dailyStartTime.todayStartTimeMs;

      let dailyEndTime = infoStore.dailyEndTime;
      let todayEndTimeMs = infoStore.dailyEndTime.todayEndTimeMs;

      let notificationTimes = [];

      let newEntry = todayStartTimeMs;

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

      for (let i = 0; i <= 50; ) {
        if (secureCounter == 0) {
          newEntry = todayStartTimeMs;
        } else {
          newEntry += dailyIntervalMs;
        }
        // console.log('userStore - setNotifications - i', i);
        // console.log(
        //   'userStore - setNotifications - secureCounter',
        //   secureCounter
        // );
        // console.log('userStore - setNotifications - newEntry', newEntry);

        // newEntry += dailyIntervalMs;

        let newEntryHour = dayjs(newEntry).hour();
        // console.log(
        //   'userStore - setNotifications - newEntryHour',
        //   newEntryHour
        // );

        if (
          newEntryHour >= dailyStartTimeHour &&
          newEntryHour < dailyEndTimeHour &&
          newEntry > nowMs
        ) {
          // console.log('userStore - setNotifications - if1');
          if (newEntry < lastShortAnswerPlusBreakMs) {
            // Check if Timer is kurzfragebogen Timer is running and add Timer to newEntry
            // if regular calculated Entry (every 2 Hours) is before the 30min Timer is over, than make the new Entry at the same time the 30min timer is over
            let newEntryPlus = lastShortAnswerPlusBreakMs;
            notificationTimes.push(newEntryPlus);
            // console.log(
            //   'userStore - setNotifications - newEntryPlus < lastShortAnswerPlusBreakMs',
            //   dayjs(newEntryPlus)
            // );
          } else {
            // console.log(
            //   'userStore - setNotifications - newEntry',
            //   dayjs(newEntry)
            // );
            notificationTimes.push(newEntry);
          }

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

      notificationTimes.value = notificationTimes;
      const storage = new Storage();
      await storage.create();
      await storage.set('notificationTimes', notificationTimes);

      // setting nextShortAnswerMs to first array entry
      questionsStore.nextShortAnswerMs = notificationTimes[0];

      await storage.set('nextShortAnswerMs', notificationTimes[0]);

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
      let notificationArray = [];

      await resetNotifications();
      notificationArray.value = [];

      // let now = dayjs();
      // let nowPlusOneMinute = dayjs().add(5, 'second').valueOf();
      console.log(
        'Notifiations - setNotifications - notificationTimes',
        notificationTimes
      );

      for (const [i, notificationTime] of notificationTimes.entries()) {
        // let notificationId = notificationTime - dayjs('2022-01-01').valueOf;
        // // There is a limit on the Id (32bit int), so we start the id at 2022
        let notificationEntry = {
          id: i,
          channelId: 1,
          title: `FU Berlin App`,
          body: `Sie können einen weiteren Fragebogen ausfüllen`,
          schedule: {
            at: new Date(notificationTime),
            allowWhileIdle: true,
          },
          foreground: true,
          smallIcon: 'ic_stat_tonne',
          extra: {},
          sound: 'none',
        };
        notificationArray.push(notificationEntry);
      }

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

      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (payload) => {
          // Redirect to shortquestions if conditions are right, else go to home
          console.log(
            'Notifiations - setNotifications - requestPermissions - addListener',
            payload
          );
          onStartQuestionsShort();
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
  }

  async function resetNotifications() {
    try {
      // var id;
      let idsArray = [];
      await LocalNotifications.getPending().then(function (result) {
        console.log(
          'Notifiations - cancel - showNotification - result',
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
      });
      console.log('Notifiations - cancel - showNotification -id', idsArray);

      if (idsArray.length != 0) {
        for (var [noteCount] of Object.entries(idsArray)) {
          let noteId = idsArray[noteCount];

          await LocalNotifications.cancel({
            notifications: [{ id: noteId }],
          });
        }
      }

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
  }

  // getters: {
  //   getUserData: (state) => state.userData,
  // },
  return {
    userData,
    showDevbox,
    uniqueUserId,
    randomArray,
    complianceAccepted,
    briefingShortChecked,
    appMessage,
    dailyLoop,
    notificationTimes,
    updateUserData,
    logout,
    login,
    dailyFunction,
    dailyFunctionLoop,
    clearDailyFunction,
    validateToken,
    atAppStart,
    createRandomArray,
    onStartQuestionsShort,
    setTestNotifications,
    testRouter,
    setNotifications,
    resetNotifications,
  };
});
