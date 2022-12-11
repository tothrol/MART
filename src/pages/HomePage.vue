<template>
  <base-layout>
    <div class="box blue">
      <div class="info">
        <div class="uiqueUserId">
          Teilnehmer Id: <span class="big">{{ userStore.uniqueUserId }}</span>
        </div>
        <div class="total_nr_answers">
          Insgesamt ausgefüllte Fragebögen:
          <span class="big">{{ questionsStore.totalShortAnswers }}</span>
        </div>
        <div class="today_nr_answers">
          Heute ausgefüllte Fragebögen:
          <span class="big">{{ questionsStore.todayShortAnswers }}/6</span>
        </div>
      </div>
      <div>
        <div class="countdown">
          <div>Ende der Studie in</div>
          <div class="countdown_times">
            <span v-if="countdownDays > 0"
              >{{ countdownDays }} Tag<span v-if="countdownDays > 1"
                >en</span
              ></span
            >
            {{ countdownHours }} Stunde<span
              v-if="countdownHours > 1 || countdownHours == 0"
              >n</span
            >
            und

            {{ countdownMinutes }} Minute<span
              v-if="countdownMinutes > 1 || countdownMinutes == 0"
              >n</span
            >
          </div>
        </div>
      </div>

      <div
        class="timer_wrapper display_none"
        v-if="secToNext >= 1 && questionsStore.todayShortAnswers < 6"
      >
        <div class="timer_text display_none">
          Zeit bis zum nächsten Fragebogen:
        </div>
        <div class="timer">
          <div class="display_none">
            <div>DateNow: {{ dateNow }}</div>
            <div>DateLast: {{ dateLast }}</div>
            <div>DateNext: {{ dateNext }}</div>
            <div>minToNext:{{ minToNext }}</div>
            <div>secToNext:{{ secToNext }}</div>
          </div>
          <div>{{ minutes }}:{{ seconds }}</div>
        </div>
      </div>

      <div class="timeframe_messages">
        {{ timeframeMessage }}
      </div>
      <div class="dailytime_messages" v-if="timeframeMessage === ''">
        {{ dailyTimeMessage }}
      </div>

      <ion-button
        @click="onStartQuestionsInitial()"
        v-if="
          questionsStore.initialAnswerExist === false && timeframe && dailyTime
        "
        >Initialen Fragebogen starten</ion-button
      >

      <ion-button
        @click="onStartQuestionsShort()"
        v-if="
          userStore.complianceAccepted === true &&
          questionsStore.initialAnswerExist === true &&
          timeframe &&
          dailyTime
        "
        :disabled="secToNext >= 1 || questionsStore.todayShortAnswers >= 6"
        >Fragebogen starten</ion-button
      >

      <div
        class="result_buttons"
        v-if="
          userStore.userData.username === 'nviiadmin' ||
          userStore.userData.username === 'RolandToth'
        "
      >
        <router-link class="link_button" to="/answers">
          <ion-button color="medium">Auswertung ansehen</ion-button>
        </router-link>
        <router-link class="link_button" to="/statistics">
          <ion-button color="medium">Nutzungsstatistiken</ion-button>
        </router-link>
      </div>
    </div>

    <div
      class="adminbox"
      v-if="
        userStore.userData.username === 'nviiadmin' ||
        userStore.userData.username === 'RolandToth'
      "
    >
      <ion-button
        color="medium"
        @click="userStore.showDevbox = !userStore.showDevbox"
        >info</ion-button
      >

      <ion-button
        color="medium"
        @click="
          questionsStore.initialAnswerExist = !questionsStore.initialAnswerExist
        "
        >Change Fragebogen</ion-button
      >

      <ion-button color="medium" @click="secToNext = 0">Skip Timer</ion-button>
    </div>

    <div class="devbox" v-if="userStore.showDevbox">
      <div class="next_notifications">
        Next Notifications:
        <div
          class="notification_times"
          v-for="notification of userStore.notificationTimes.slice(0, 10)"
          :key="notification"
        >
          {{ dayjs(notification).format('DD.MM.YY HH:mm') }}
        </div>
      </div>
      <br />
      <div class="timer_text">Time to next Sheet / Notification:</div>
      <div class="timer">
        <div class="display_none">
          <div>DateNow: {{ dateNow }}</div>
          <div>DateLast: {{ dateLast }}</div>
          <div>DateNext: {{ dateNext }}</div>
          <div>minToNext:{{ minToNext }}</div>
          <div>secToNext:{{ secToNext }}</div>
        </div>
        <div>{{ minutes }}:{{ seconds }}</div>
      </div>
      <div v-if="userStore.userData.username == 'nviiadmin'">
        <div>initialAnswerExist: {{ questionsStore.initialAnswerExist }}</div>
        <ion-button color="medium" @click="userStore.setTestNotifications"
          >set Test Notifications</ion-button
        >
        <ion-button color="medium" @click="userStore.setNotifications"
          >set Notifications</ion-button
        >
        <ion-button color="medium" @click="secToNext = 5"
          >Skip Timer</ion-button
        >

        getOptionsCounter: {{ infoStore.testCounter }}
        <ion-button color="medium" @click="statsStore.getStats"
          >get Stats</ion-button
        >
        <ion-button color="medium" @click="questionsStore.todayShortPlus"
          >shortanswer ++</ion-button
        >
        <ion-button color="medium" @click="questionsStore.todayShortAnswers--"
          >shortanswer --</ion-button
        >
        <ion-button
          color="medium"
          @click="
            questionsStore.initialAnswerExist =
              !questionsStore.initialAnswerExist
          "
          >Toggel initialAnswerExist</ion-button
        >{{ questionsStore.initialAnswerExist }}

        <ion-button
          color="medium"
          @click="questionsStore.checkIfInitalAnswerExists"
          >checkIfInitalAnswersExists</ion-button
        >{{ questionsStore.initialAnswerExist }}
        <router-link class="link_button" to="/questionsinitial">
          <ion-button color="medium">Initialen Fragebogen starten</ion-button>
        </router-link>
        <router-link class="link_button" to="/questionsShort">
          <ion-button color="medium">Fragebogen starten</ion-button>
        </router-link>
        <router-link class="link_button" to="/welcome">
          <ion-button color="medium">welcome</ion-button>
        </router-link>
      </div>
    </div>
    <!-- <modal-component :welcome></modal-component>
    <modal-component :datenschutz></modal-component> -->
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useStatsStore } from '@/stores/statsStore';
  import { useInfoStore } from '@/stores/infoStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import messageBoxComponent from '@/components/MessageboxComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import router from '@/router';
  import { App } from '@capacitor/app';

  const userStore = useUserStore();
  const statsStore = useStatsStore();
  const questionsStore = useQuestionsStore();
  const infoStore = useInfoStore();

  let showMessage = ref(false);

  let minToNext = ref(0);
  let secToNext = ref(0);
  // let welcome = ref();
  // welcome.value = infoStore.welcomeText;

  // watch(questionsStore.lastShortAnswer, (newValue, oldValue) => {});

  async function onStartQuestionsShort() {
    // check for validToken
    let answer = await userStore.validateToken();
    console.log('Home await validateToken - answer', answer);
    if (answer.code === 'ERR_NETWORK') {
      userStore.appMessage =
        'Bitte stellen Sie sicher das eine Internetverbindung besteht! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';
      return;
    } else if (answer.status != 200 && answer.status != 201) {
      userStore.appMessage =
        'Bitte melden Sie sich erneut an! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';

      router.push('/login');
      return;
    }

    // end check for validToken

    if (userStore.briefingShortChecked === false) {
      router.push('/briefing-short');
    } else {
      router.push('/questionsshort');
    }
  }

  async function onStartQuestionsInitial() {
    // check for validToken
    let answer = await userStore.validateToken();
    console.log('Home await validateToken - answer', answer);
    if (answer.code === 'ERR_NETWORK') {
      userStore.appMessage =
        'Bitte stellen Sie sicher das eine Internetverbindung besteht! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';
      return;
    } else if (answer.status != 200 && answer.status != 201) {
      userStore.appMessage =
        'Bitte melden Sie sich erneut an! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';

      router.push('/login');
      return;
    }

    // end check for validToken
    router.push('/questionsinitial');
  }

  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive);
    initDate();
  });

  watch(
    () => questionsStore.lastShortAnswer,
    (oldValue, newValue) => {
      console.log('Home - changes detected', oldValue, newValue);
      initDate();
    }
  );

  watch(
    () => questionsStore.nextShortAnswerMs,
    (oldValue, newValue) => {
      console.log(
        'Home - changes detected nextShortAnswerMs',
        oldValue,
        newValue
      );
      initDate();
    }
  );

  watch(
    () => infoStore.breakBetweenShortQuestions,
    (oldValue, newValue) => {
      console.log(
        'Home - changes detected -infoStore.breakBetweenShortQuestions',
        oldValue,
        newValue
      );
      initDate();
    }
  );

  watch(
    () => infoStore.endDate.dayJs,
    (oldValue, newValue) => {
      console.log(
        'Home - changes detected -infoStore.endDate',
        oldValue,
        newValue
      );
      countdownTimer();
    }
  );
  watch(
    () => infoStore.dailyEndTime.hours,
    (oldValue, newValue) => {
      console.log(
        'Home - changes detected -infoStore.dailyEndTime',
        oldValue,
        newValue
      );
      countdownTimer();
    }
  );

  infoStore.dailyEndTime.hours;

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

  let minutes = computed(() => {
    return formatTo2digit(Math.floor(secToNext.value / 60));
  });

  let seconds = computed(() => {
    return formatTo2digit(secToNext.value % 60);
  });

  dayjs.extend(relativeTime);

  // async function timer() {
  //   // let dateNextMinSec = dayjs(dateNext).format('mm/ss');

  //   // let timeNext = dayjsdateNext.value;

  //   if (minToNext.value >= 1) {
  //     minToNext.value = minToNext.value - 1;

  //     // let time = dayjs(dateNow).to(dateNext, true);

  //     setTimeout(timer, 1000 * 60); /* replicate wait 1 second */
  //   }
  // }

  let secT;

  async function secTimer() {
    if (secToNext.value >= 1) {
      questionsStore.timerShortQuestionsRuns = true;
      secToNext.value = secToNext.value - 1;

      secT = window.setTimeout(secTimer, 1000); /* replicate wait 1 second */
    } else {
      secToNext.value = 0;
      questionsStore.timerShortQuestionsRuns = false;
    }
  }

  let countdownMinutes = ref(null);
  let countdownHours = ref(null);
  let countdownDays = ref(null);

  let countdownTimeout;

  async function countdownTimer() {
    let now = dayjs();
    let endDate = infoStore.endDate.dayJs;
    // endDate = endDate.add(Number(infoStore.dailyEndTime.hours));
    // endDate = endDate.add(Number(infoStore.dailyEndTime.minutes));
    endDate = endDate.add(Number(infoStore.dailyEndTime.hours), 'hour');
    endDate = endDate.add(Number(infoStore.dailyEndTime.minutes), 'minute');

    console.log('Home - countdownTimer - now', now);
    console.log('Home - countdownTimer - endDate', endDate);

    countdownDays.value = endDate.diff(now, 'day');
    let countdownTotalHours = endDate.diff(now, 'hour');
    countdownHours.value = formatTo1digit(countdownTotalHours % 24);
    // something like 26 hours will become 2 hours

    let countdownTotalMinutes = endDate.diff(now, 'minute');
    // countdownMinutes.value = endDate.diff(now, 'minute');
    countdownMinutes.value = formatTo1digit(countdownTotalMinutes % 60);

    countdownTimeout = window.setTimeout(
      countdownTimer,
      1000 * 60
    ); /* replicate wait 1 second */
  }

  // async function countdownTimer() {
  //   if (countdownHours.value >= 1) {
  //     secToNext.value = secToNext.value - 1;

  //     countdownTimeout = window.setTimeout(
  //       secTimer,
  //       1000 * 60 * 60
  //     ); /* replicate wait 1 second */
  //   } else {
  //     return;
  //   }
  // }

  let dateNow = ref({});
  let dateLast = ref({});
  let dateNext;

  async function initDate() {
    console.log('Home - initDate');
    dateNext = dayjs(questionsStore.nextShortAnswerMs);
    let lastShortAnswer = questionsStore.lastShortAnswer;
    if (lastShortAnswer != undefined) {
      dateNow.value = dayjs();
      dateLast.value = dayjs(lastShortAnswer);

      secToNext.value = dateNext.diff(dateNow.value, 's');

      clearTimeout(secT);
      secTimer();
    }
  }

  onMounted(async () => {
    // questionsStore.checkIfInitalAnswerExists();
    initDate();
    countdownTimer();
    // questionsStore.countShortAnswers();
  });

  let timeframe = computed(() => {
    let nowMs = dayjs().valueOf();
    let startDateMs = infoStore.startDate.ms;
    let endDateMs = infoStore.endDate.ms;
    // endDateMs is midnight of the WP entry, so its initially exlusive of the WP entry, therefore hours and minutes of dailyEndTime have to be addet
    endDateMs =
      endDateMs +
      infoStore.dailyEndTime.hours * 60 * 60 * 1000 +
      infoStore.dailyEndTime.minutes * 60 * 1000;

    console.log;
    if (startDateMs != '' && endDateMs != '') {
      if (nowMs < startDateMs) {
        // project timeframe has not started
        // userStore.appMessage = 'Der Projektzeitraum startet am' + infoStore.startDate.string + '.'
        checkTimeframe('notStarted');
        return false;
      } else if (nowMs > endDateMs) {
        // Project timeframe is over
        checkTimeframe('over');

        return false;
      } else {
        resetTimeMessage();
        return true;
      }
    } else {
      resetTimeMessage();
      return true;
    }
  });

  let dailyTime = computed(() => {
    let nowMs = dayjs().valueOf();
    let startTimeMs = infoStore.dailyStartTime.todayStartTimeMs;
    let endTimeMs = infoStore.dailyEndTime.todayEndTimeMs;

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
      return true;
    }
  });

  let timeframeMessage = ref('');
  let dailyTimeMessage = ref('');

  function checkTimeframe(value) {
    if (value === 'notStarted') {
      let message =
        'Der Projektzeitraum startet am: ' + infoStore.startDate.string + '.';
      userStore.appMessage = message;
      timeframeMessage.value = message;
    }
    if (value === 'over') {
      let message =
        'Der Projektzeitraum endete am: ' + infoStore.endDate.string + '.';
      userStore.appMessage = message;
      timeframeMessage.value = message;
    }
  }

  function setDailyTimeMessage() {
    let message =
      'Der Fragebogen ist täglich von ' +
      infoStore.dailyStartTime.string +
      ' bis ' +
      infoStore.dailyEndTime.string +
      ' Uhr ausfüllbar.';
    userStore.appMessage = message;
    dailyTimeMessage.value = message;
  }
  function resetTimeMessage() {
    timeframeMessage.value = '';
    dailyTimeMessage.value = '';
  }
</script>

<style scoped>
  .timeframe_messages,
  .dailytime_messages {
    margin-bottom: 25px;
  }
  .timer {
    color: var(--ion-color-danger);
  }

  .timer_wrapper {
    margin-bottom: 50px;
  }

  .info {
    margin-bottom: 50px;
  }

  .total_nr_answers {
    margin-bottom: 10px;
  }

  .big {
    font-size: 25px;
    font-weight: 500;
  }

  .uiqueUserId {
    margin-bottom: 50px;
  }

  .result_buttons {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .countdown {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .countdown_times {
    font-weight: 500;
    font-size: 18px;
    margin-top: 10px;
  }
</style>
