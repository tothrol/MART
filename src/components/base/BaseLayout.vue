<template>
  <ion-page id="main-content">
    <transition name="menu">
      <menu-component
        content-id="main-content"
        v-if="showMenu"
        @toggleMenu="showMenu = !showMenu"
      >
      </menu-component>
    </transition>
    <header-component
      v-show="props.fullscreen != true"
      @toggleMenu="showMenu = !showMenu"
    ></header-component>

    <ion-content
      :color="backgroundColor"
      ref="myContent"
      :scrollTop="scrollTop"
      :fullscreen="props.fullscreen"
    >
      <div id="main">
        <slot></slot>
      </div>
    </ion-content>
    <footer-component v-if="props.fullscreen != true"></footer-component>
    <transition>
      <messagebox-component
        type="normal"
        name="fade"
        v-if="userStore.appMessage != '' && userStore.showAppMessage"
        ><p
          v-html="userStore.appMessage"
          style="white-space: pre-line"
        ></p></messagebox-component
    ></transition>
    <transition>
      <messagebox-component
        type="netError"
        name="fade"
        v-if="
          userStore.appMessageNetError != '' && userStore.showAppMessageNetError
        "
        ><p
          v-html="userStore.appMessageNetError"
          style="white-space: pre-line"
        ></p></messagebox-component
    ></transition>
    <transition>
      <messagebox-component
        type="timeframe"
        name="fade"
        v-if="
          userStore.appMessageTimeframe != '' &&
          userStore.showAppMessageTimeframe
        "
        ><p
          v-html="userStore.appMessageTimeframe"
          style="white-space: pre-line"
        ></p
      ></messagebox-component>
    </transition>
    <devbox-component
      @triggerShortQ="onStartQuestionsShort()"
    ></devbox-component>
    <div class="ios_header"></div>
  </ion-page>
</template>

<script setup lang="ts">
  import { IonPage } from '@ionic/vue';
  import {
    defineComponent,
    ref,
    defineExpose,
    defineProps,
    watch,
    watchEffect,
    computed,
    onMounted,
    toRaw,
  } from 'vue';
  import dayjs from 'dayjs';
  import { IonContent, ionMenu } from '@ionic/vue';
  import {
    chevronBackOutline,
    personCircleOutline,
    menuOutline,
  } from 'ionicons/icons';
  import HeaderComponent from '@/components/base/HeaderComponent.vue';
  import FooterComponent from '@/components/base/FooterComponent.vue';
  import MessageboxComponent from '@/components/MessageboxComponent.vue';
  import DevboxComponent from '@/components/DevboxComponent.vue';
  import type { InjectionKey } from 'vue';
  import MenuComponent from '../MenuComponent.vue';
  import { useUserStore } from '@/stores/userStore';
  import { useInfoStore } from '@/stores/infoStore';
  import { useStatsStore } from '@/stores/statsStore';

  import { useQuestionsStore } from '@/stores/questionsStore';

  import { useRouter, useRoute } from 'vue-router';

  import relativeTime from 'dayjs/plugin/relativeTime';

  import { LocalNotifications } from '@capacitor/local-notifications';
  import { useBackButton, useIonRouter } from '@ionic/vue';
  import { App } from '@capacitor/app';

  import { Capacitor } from '@capacitor/core';

  import { envtest } from '@/composables/envtest';

  // import 'dotenv/config';

  let platform = Capacitor.getPlatform();

  let contentColor = 'primary';

  const questionsStore = useQuestionsStore();
  const userStore = useUserStore();
  const infoStore = useInfoStore();
  const statsStore = useStatsStore();
  const router = useRouter();
  const route = useRoute();

  let conditionsQuestionsShort = false;

  let lastAppMessage;

  async function onStartQuestionsShort() {
    console.log(
      'BaseLayout - onStartQuestionsShort - infoStore.secToNext',
      infoStore.secToNext
    );

    // console.log(
    //   'BaseLayout - onStartQuestionsShort - userData: ',
    //   userStore.userData
    // );
    // console.log(
    //   'BaseLayout - onStartQuestionsShort - questionsStore.initialAnswerExist: ',
    //   questionsStore.initialAnswerExist
    // );
    // check for validToken of token is '', then check auth will handel it
    if (userStore.userData.token != '') {
      let answer = await userStore.validateToken(userStore.userData.token);
      console.log('BaseLayout - await validateToken - answer', answer);
      if (answer.code === 'ERR_NETWORK') {
        // userStore.appMessage =
        //   'Bitte stellen Sie sicher das eine Internetverbindung besteht! <br><br> Code: ' +
        //   answer.code +
        //   '<br>Message: ' +
        //   answer.message +
        //   '';
        let appMsg2 =
          'Bitte stellen Sie sicher, das eine Internetverbindung besteht!';

        if (userStore.appMessageNetError != appMsg2) {
          userStore.appMessageNetError = appMsg2;
          userStore.showAppMessageNetError = true;
        }
        console.log('BaseLayout - onStartQuestionsShort - NOpush -Err_Network');
        return;
      } else if (answer.status != 200 && answer.status != 201) {
        let appMessage =
          'Bitte melden Sie sich erneut an! <br><br> Code: ' +
          answer.code +
          '<br>Message: ' +
          answer.message +
          '';
        // let appMessage =
        //   'Name oder Passwort falsch, bitte erneut versuchen';
        if (appMessage != lastAppMessage) {
          // preventing appMessage popup to often
          lastAppMessage = appMessage;
          userStore.appMessage = appMessage;
          userStore.showAppMessage = true;
        }

        console.log('BaseLayout - onStartQuestionsShort - push - login');
        router.replace({ path: '/login' });
        return;
      }
      //
      userStore.appMessageNetError = '';
      userStore.showAppMessageNetError = false;
      //

      // end check for validToken

      // console.log(
      //   'BaseLayout - onStartQuestionsShort - userStore.complianceAccepted ',
      //   userStore.complianceAccepted
      // );
      // console.log(
      //   'BaseLayout - onStartQuestionsShort - questionsStore.initialAnswerExist ',
      //   questionsStore.initialAnswerExist
      // );
      // console.log(
      //   'BaseLayout - onStartQuestionsShort - questionsStore.todayShortAnswers ',
      //   questionsStore.todayShortAnswers
      // );
      // console.log(
      //   'BaseLayout - onStartQuestionsShort - timeframe.value ',
      //   timeframe.value
      // );
      // console.log(
      //   'BaseLayout - onStartQuestionsShort - dailyTime.value ',
      //   dailyTime.value
      // );
      // console.log(
      //   'BaseLayout - onStartQuestionsShort - infoStore.secToNext ',
      //   infoStore.secToNext
      // );

      if (conditionsQuestionsShort && platform != 'web') {
        if (userStore.briefingShortChecked === false) {
          console.log(
            'BaseLayout - onStartQuestionsShort - push - briefing-short'
          );
          router.replace({ path: '/briefing-short' });
        } else {
          console.log(
            'BaseLayout - onStartQuestionsShort - push - questionsShort'
          );

          router.replace({ path: '/questionsshort' });
        }
      } else {
        console.log('BaseLayout - onStartQuestionsShort - NOpush');
        // router.replace('/home');
      }
    }
  }

  let timeframe = computed(() => {
    // Question: When is timeframe computed: 1 Minute
    let nowMs = dayjs().valueOf();
    let startDateMs = infoStore.startDate.ms;
    let endDateMs = toRaw(infoStore.endDate.ms);

    // minutes is only needet to get an update every minute of daily time.
    //  The update every minute is needeet to route away from questionsshort if the dailyTime is false
    // minutes is set by the oneMinuteTimer
    let minutesCounter = infoStore.minutesCounter;
    console.log('BaseLayout - timeframe - minutesCounter: ', minutesCounter);
    let appStateChangeCounter = infoStore.appStateChangeCounter;
    console.log(
      'BaseLayout - timeframe - appStateChangeCounter: ',
      appStateChangeCounter
    );

    console.log('BaseLayout - timeframe - startDateMs: ', startDateMs);
    console.log('BaseLayout - timeframe - endDateMs: ', endDateMs);
    // endDateMs is midnight of the WP entry, so its initially exlusive of the WP entry, therefore hours and minutes of dailyEndTime have to be addet
    endDateMs =
      endDateMs +
      infoStore.dailyEndTime.hours * 60 * 60 * 1000 +
      infoStore.dailyEndTime.minutes * 60 * 1000;

    if (infoStore.startDate.ms != '' && infoStore.endDate.ms != '') {
      if (nowMs < startDateMs) {
        // project timeframe has not started
        // userStore.appMessage = 'Der Projektzeitraum startet am' + infoStore.startDate.string + '.'
        checkTimeframe('notStarted');
        console.log('BaseLayout - timeframe - false1');
        return false;
      } else if (nowMs > endDateMs) {
        // Project timeframe is over
        checkTimeframe('over');
        console.log('BaseLayout - timeframe - false2', endDateMs);
        userStore.resetNotifications();

        return false;
      } else {
        console.log('BaseLayout - timeframe - true');
        resetTimeMessage();
        return true;
      }
    } else {
      resetTimeMessage();
      console.log('BaseLayout - timeframe - false3');
      return false;
    }
  });

  watchEffect(() => {
    console.log('BaseLayout - watchEffect - timeframe.value', timeframe.value);
    infoStore.timeframe = timeframe.value;
  });

  // only here to trigger updates to dailyTime

  let dailyTime = computed(() => {
    console.log('BaseLayout - dailyTime');
    let nowMs = dayjs().valueOf();
    let dailyStartTime = infoStore.dailyStartTime;
    let startTimeMs = dailyStartTime.todayStartTimeMs;

    let dailyEndTime = infoStore.dailyEndTime;
    let endTimeMs = dailyEndTime.todayEndTimeMs;

    // minutes is only needet to get an update every minute of daily time.
    //  The update every minute is needeet to route away from questionsshort if the dailyTime is false
    // minutes is set by the oneMinuteTimer
    let minutesCounter = infoStore.minutesCounter;
    console.log('BaseLayout - dailyTime - min: ', minutesCounter);
    let appStateChangeCounter = infoStore.appStateChangeCounter;
    // appStateChangeCounter needet to trigger changes whenever app starts again
    console.log(
      'BaseLayout - dailyTime - appStateChangeCounter: ',
      appStateChangeCounter
    );
    console.log(
      'BaseLayout - dailyTime - infoStore.dailyStartTime.todayStartTimeMs: ',
      infoStore.dailyStartTime.todayStartTimeMs
    );

    if (startTimeMs != '' && endTimeMs != '') {
      if (nowMs < startTimeMs) {
        // project timeframe has not started
        // userStore.appMessage = 'Der Projektzeitraum startet am' + infoStore.startDate.string + '.'
        setDailyTimeMessage();

        return false;
      } else if (nowMs > endTimeMs) {
        // Project timeframe is over
        setDailyTimeMessage();

        return false;
      } else {
        resetTimeMessage();
        return true;
      }
    } else {
      resetTimeMessage();
      return false;
    }
  });

  watchEffect(() => {
    console.log('BaseLayout - watchEffect - dailyTime', dailyTime.value);
    infoStore.dailyTime = dailyTime.value;
  });

  function checkTimeframe(value) {
    if (value === 'notStarted') {
      let message =
        'Der Projektzeitraum startet am: ' + infoStore.startDate.string + '.';
      userStore.appMessageTimeframe = message;
      userStore.showAppMessageTimeframe = true;
      infoStore.timeframeMessage = message;
    }
    if (value === 'over') {
      let message =
        'Vielen Dank für Ihre Teilnahme! Die Studie ist hiermit beendet und Sie dürfen MART nun gern deinstallieren. Sie werden bald darüber informiert, wie hoch die Entschädigung für Ihre Teilnahme ist.';

      let appMsg = 'Studie abgeschlossen!';

      if (userStore.appMessageTimeframe != appMsg) {
        userStore.appMessageTimeframe = appMsg;
        userStore.showAppMessageTimeframe = true;
      }
      infoStore.timeframeMessage = message;
    }
  }

  function setDailyTimeMessage() {
    let message =
      'Der Kurzfragebogen ist täglich von ' +
      infoStore.dailyStartTime.string +
      ' bis ' +
      infoStore.dailyEndTime.string +
      ' Uhr ausfüllbar.';
    // userStore.appMessage = message;
    infoStore.dailyTimeMessage = message;
  }
  function resetTimeMessage() {
    infoStore.timeframeMessage = '';
    infoStore.dailyTimeMessage = '';
  }

  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive);
    secTimer();
    oneMinuteTimer();
    infoStore.appStateChangeCounter++;
    // Needet to calculate shortAnswers when
    questionsStore.calculateTodayShortAnswers();
  });

  watch(
    () => questionsStore.nextShortAnswerMs,
    (newValue, oldValue) => {
      console.log(
        'BaseLayout - changes detected nextShortAnswerMs',
        oldValue,
        newValue
      );
      secTimer();
    }
  );

  watch(
    () => infoStore.endDate.dayJs,
    (newValue, oldValue) => {
      console.log(
        'BaseLayout - changes detected -infoStore.endDate',
        oldValue,
        newValue
      );
      countdownTimer();
    }
  );
  watch(
    () => infoStore.dailyEndTime.hours,
    (newValue, oldValue) => {
      console.log(
        'BaseLayout - changes detected -infoStore.dailyEndTime',
        oldValue,
        newValue
      );
      countdownTimer();
    }
  );

  function formatTo2digit(input) {
    let formated = input.toLocaleString('de-DE', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    return formated;
  }
  function formatTo1digit(input) {
    let formated = input.toLocaleString('de-DE', {
      minimumIntegerDigits: 1,
      useGrouping: false,
    });

    return formated;
  }

  dayjs.extend(relativeTime);

  let secT;
  // let secToNext = ref(null);

  async function secTimer() {
    // Runs continious
    clearTimeout(secT);
    if (infoStore.secToNext != undefined) {
      //
      let dateNow = dayjs();
      let dateNext = dayjs(questionsStore.nextShortAnswerMs);
      // let lastShortAnswer = questionsStore.lastShortAnswer;
      // initial lastShortAnswer = ""
      infoStore.secToNext = dateNext.diff(dateNow, 's');

      // START Conditions Timeframe

      let now = dayjs().valueOf();
      // console.log('now', now);
      // console.log('startOfInterval New', now);
      userStore.notificationTimes.some(function (startOfInterval, index) {
        // console.log('startOfInterval: ', startOfInterval);
        // console.log(
        //   'startOfInterval .index+1: ',
        //   userStore.notificationTimes[index + 1]
        // );

        if (
          now > startOfInterval &&
          now < userStore.notificationTimes[index + 1]
        ) {
          // Current Interval
          // console.log('startOfInterval - Current Interval: ', startOfInterval);
          userStore.startOfThisInterval = startOfInterval;
          userStore.endOfThisInterval = userStore.notificationTimes[index + 1];
          userStore.startOfIntervalsRandomNotification =
            userStore.notificationTimesRandom[index];

          if (now > userStore.notificationTimesRandom[index]) {
            // Condition true
            // now is between notification and end of interval
            // console.log('startOfInterval - Condition: ', startOfInterval);
            userStore.conditionInterval = true;
          } else {
            userStore.conditionInterval = false;
          }
          // return true is only here to exit the loop
          return true;
        } else if (now < startOfInterval) {
          // next Interval has not started
          // secToNext must be more than 0
          // console.log(
          //   'startOfInterval now < startOfInterval: ',
          //   userStore.notificationTimes[index + 1]
          // );
          userStore.conditionInterval = false;
          userStore.endOfThisInterval = userStore.notificationTimes[index + 1];
          userStore.startOfThisInterval = 0;
          userStore.startOfIntervalsRandomNotification = 0;
          return true;
        }
        // return true is only here to exit the loop
        // return true;
      });

      // END Conditions Timeframe

      // START check for next day to reset infoStore.dailyStart/EndTime.todayStartTimeMs
      // todayStartTimeMs is either today or yesterday
      // console.log(
      //   'secTimer - infoStore.dailyStartTime.todayStartTimeMs',
      //   infoStore.dailyStartTime.todayStartTimeMs
      // );
      let todayStartTimeMs = dayjs(
        infoStore.dailyStartTime.todayStartTimeMs
      ).format('DD.MM.YY');
      let nowString = dayjs().format('DD.MM.YY');
      // console.log('secTimer - todayStartTimeMs', todayStartTimeMs, nowString);
      if (nowString != todayStartTimeMs) {
        console.log('secTimer - its a new day', todayStartTimeMs, nowString);
        if (Object.keys(infoStore.datesAndTimes).length != 0) {
          console.log(
            'BaseLayout - secTimer - infoStore.calculateDatesAndTimes '
          );
          infoStore.calculateDatesAndTimes(toRaw(infoStore.datesAndTimes));
        }
        // console.log('secTimer - its a new day 2', todayStartTimeMs, nowString);
      }
      // END check for next day to reset infoStore.dailyStart/EndTime.todayStartTimeMs
      secT = window.setTimeout(secTimer, 1000); /* replicate wait 1 second */
    }
  }

  let oneMinuteTimerTimeout;

  function oneMinuteTimer() {
    clearTimeout(oneMinuteTimerTimeout);
    let now = dayjs();
    let then = dayjs(0);
    infoStore.minutesCounter = now.diff(then, 'm');
    countdownTimer();

    questionsStore.calculateTodayShortAnswers();
    if (platform != 'web') {
      checkIfNotificationsLeft();
    } else {
      infoStore.pendingNotificationsCount = 'its Web';
    }

    oneMinuteTimerTimeout = window.setTimeout(
      oneMinuteTimer,
      1000 * 60
    ); /* replicate wait 1 second */
  }

  setInterval(oneMinuteTimer, 1000 * 60);

  // let countdownTimeout;

  // displays the Countdown on the Home Page

  async function countdownTimer() {
    infoStore.countdownTimerCounter++;
    let now = dayjs();
    let endDate = dayjs(infoStore.endDate.ms);
    // endDate = endDate.add(Number(infoStore.dailyEndTime.hours));
    // endDate = endDate.add(Number(infoStore.dailyEndTime.minutes));
    console.log('BaseLayout - endDate', JSON.stringify(toRaw(endDate)));
    console.log(
      'BaseLayout - infoStore.dailyEndTime',
      JSON.stringify(toRaw(infoStore.dailyEndTime))
    );
    if (infoStore.dailyEndTime.hours != '' && endDate != null) {
      // endDate = endDate.add(Number(infoStore.dailyEndTime.hours), 'hour');
      // endDate = endDate.add(Number(infoStore.dailyEndTime.minutes), 'minute');

      console.log('BaseLayout - countdownTimer - now', now);
      console.log('BaseLayout - countdownTimer - endDate', toRaw(endDate));

      infoStore.countdownDays = endDate.diff(now, 'day');

      let countdownTotalHours = endDate.diff(now, 'hour');
      infoStore.countdownHours = formatTo1digit(countdownTotalHours % 24);
      // something like 26 hours will become 2 hours

      let countdownTotalMinutes = endDate.diff(now, 'minute');
      infoStore.countdownTotalMinutes = countdownTotalMinutes;
      infoStore.countdownMinutes = formatTo1digit(countdownTotalMinutes % 60);
    }
  }

  async function checkIfNotificationsLeft() {
    // Checks if any notifications are left
    console.log(
      'BaseLayout - checkIfNotificationsLeft - userStore.briefingShortChecked',
      userStore.briefingShortChecked.toString()
    );

    // START get pending Notifications
    let pendingNotifications = await LocalNotifications.getPending();
    console.log('Notifiations - pendingNotifications', pendingNotifications);
    infoStore.pendingNotificationsCount =
      pendingNotifications.notifications.length;

    // END get pending Notifications

    if (
      pendingNotifications.notifications.length === 0 &&
      questionsStore.shortAnswersArray.length >= 1
      // ||
      // (questionsStore.shortAnswersArray.length === 0 &&
      //   userStore.briefingShortChecked === true)
    ) {
      console.log('BaseLayout - checkIfNotificationsLeft - No Notifications');
      console.log(
        'BaseLayout - checkIfNotificationsLeft - No Notifications - userStore.briefingShortChecked',
        userStore.briefingShortChecked.toString()
      );
      userStore.setNotifications();
    }
  }

  onMounted(async () => {
    console.log('BaseLayout - onMounted');
    // console.log('dotenv', process.env.NODE_ENV_SOMEKEY);
    // console.log('dotenv Node', process.env);
    envtest();
    // questionsStore.checkIfInitialAnswerExists();
    // initDate();
    secTimer();
    oneMinuteTimer();
    // questionsStore.countShortAnswers();
  });

  watchEffect(() => {
    // runs every Second, coz it contains infoStore.secToNext
    // console.log('BaseLayout - watchEffect - conditionsQuestionsShort -start');

    // START Console.logs needet to trigger this computed function
    userStore.localNotificationTapped;
    userStore.userData.token;
    infoStore.secToNext;

    if (questionsStore.initialAnswerExist === false) {
      if (
        userStore.complianceAccepted === true &&
        userStore.userData.token != '' &&
        platform != 'web'
      ) {
        // console.log(
        //   'BaseLayout - watchEffect - conditionsQuestionsInitial - true'
        // );
        router.replace({ path: '/questionsinitial' });
      } else {
        // router.replace('/welcome');
      }
    }
    // END QuestionInitial Conditions

    // START before first questionsShort

    // same as below, but without secToNext, as Notifications (and secToNext) get set before first short questions
    // and therefore we need to trigger quesstions short without sec to next.

    if (
      questionsStore.shortAnswersArray.length === 0 &&
      userStore.complianceAccepted === true &&
      questionsStore.initialAnswerExist === true &&
      questionsStore.todayShortAnswers < 7 &&
      questionsStore.shortAnswersArray.length < 49 &&
      timeframe.value &&
      dailyTime.value &&
      userStore.userData.username != '' &&
      platform != 'web'
    ) {
      console.log(
        'BaseLayout - watchEffect - its the first time shortQuestions starts'
      );

      if (userStore.briefingShortChecked === false) {
        router.replace({ path: '/briefing-short' });
      } else if (userStore.conditionInterval === true) {
        // first start of questionsShort
        conditionsQuestionsShort = true;
        infoStore.conditionsQuestionsShort = true;
        onStartQuestionsShort();
      } else if (userStore.conditionInterval === false) {
        conditionsQuestionsShort = false;
      }

      // router.replace({ path: '/home' });
      // END before first questionsShort

      // START conditions questionsShort
    } else if (
      userStore.complianceAccepted === true &&
      questionsStore.initialAnswerExist === true &&
      questionsStore.todayShortAnswers < 7 &&
      questionsStore.shortAnswersArray.length < 49 &&
      timeframe.value &&
      dailyTime.value &&
      infoStore.secToNext <= 1 &&
      userStore.userData.username != '' &&
      userStore.conditionInterval === true &&
      platform != 'web'
    ) {
      conditionsQuestionsShort = true;
      infoStore.conditionsQuestionsShort = true;
      onStartQuestionsShort();

      // END conditions questionsShort
    } else {
      // conditions not met for questionsShort

      infoStore.conditionsQuestionsShort = false;
      conditionsQuestionsShort = false;
    }
  });

  // Scroll
  const myContent = ref(null);

  defineExpose({ scrollTop });

  let props = defineProps({ fullscreen: Boolean, backgroundColor: String });

  let backgroundColor = ref(
    props.backgroundColor ? props.backgroundColor : 'secondary'
  );

  function scrollTop() {
    console.log('ScrollThat');
    myContent.value.$el.scrollToPoint(0, 0, 300);
  }

  let showMenu = ref(false);
  // End Scroll
</script>

<style scoped>
  ion-content {
    --padding-end: 0px;
    --padding-start: 0px;
    --padding-top: 0px;
  }
  #main {
    max-width: 600px;
    margin-right: auto;
    margin-left: auto;

    padding: 0px 0px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    /* height: 100%;
    height: -moz-available; 
    height: -webkit-fill-available;
    height: fill-available; */
  }

  .ios #main-content {
    /* height: calc(100% - 20px); */
    /* padding-top: 45px;
    padding-bottom: 0px; */
  }

  /* MENU */

  .menu_icon {
    width: 40px;
    font-size: 40px;
    display: block;
    margin: 0;
  }

  .menu-enter-active,
  .menu-leave-active {
    transition: all 0.3s ease;
  }

  .menu-enter-from {
    transform: translateX(100vw);
  }
  .menu-leave-to {
    transform: translateX(100vw);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .ios_header {
    display: none;
  }

  .ios .ios_header {
    display: block;
    width: 100%;
    position: fixed;
    height: var(--ion-safe-area-top, 0) !important;
    height: 48px;
    background-color: var(--ion-color-medium);
    z-index: 99999;
  }
  /* END Menu */
</style>
