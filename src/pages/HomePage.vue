<template>
  <base-layout
    ><div class="box blue">
      <div class="info">
        <div class="uiqueUserId">
          Teilnehmer Id: <span class="big">{{ userStore.uniqueUserId }}</span>
        </div>
        <div class="total_nr_answers">
          Insgesammt ausgefüllte Fragebögen:
          <span class="big">{{ questionsStore.totalShortAnswers }}</span>
        </div>
        <div class="today_nr_answers">
          Heute ausgefüllte Fragebögen:
          <span class="big">{{ questionsStore.todayShortAnswers }}/6</span>
        </div>
      </div>
      <div
        class="timer_wrapper"
        v-if="secToNext >= 1 && questionsStore.todayShortAnswers < 6"
      >
        <div class="timer_text">Zeit bis zum nächsten Fragebogen:</div>
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
      <router-link
        class="link_button"
        to="/questionsinitial"
        v-if="questionsStore.initialAnswerExist === false"
      >
        <ion-button>Initialen Fragebogen starten</ion-button>
      </router-link>

      <ion-button
        @click="onStartQuestionsShort()"
        v-if="
          userStore.complianceAccepted === true &&
          questionsStore.initialAnswerExist === true
        "
        :disabled="secToNext >= 1 || questionsStore.todayShortAnswers >= 6"
        >Fragebogen starten</ion-button
      >

      <router-link class="link_button" to="/answers">
        <ion-button color="medium">Auswertung ansehen</ion-button>
      </router-link>
    </div>
    <Transition>
      <MessageboxComponent v-if="showMessage" @click="showMessage = false"
        >Here is a message</MessageboxComponent
      >
    </Transition>
    <div class="devbox" v-if="userStore.showDevbox">
      <ion-button color="medium" @click="questionsStore.todayShortPlus"
        >shortanswer ++</ion-button
      >
      <ion-button
        color="medium"
        @click="
          questionsStore.initialAnswerExist = !questionsStore.initialAnswerExist
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
    <!-- <modal-component :welcome></modal-component>
    <modal-component :datenschutz></modal-component> -->
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import messageBoxComponent from '@/components/MessageboxComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import router from '@/router';
  import { App } from '@capacitor/app';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();

  let showMessage = ref(false);

  let minToNext = ref(0);
  let secToNext = ref(0);
  // let welcome = ref();
  // welcome.value = infoStore.welcomeText;

  // watch(questionsStore.lastShortAnswer, (newValue, oldValue) => {});

  function onStartQuestionsShort() {
    if (userStore.briefingShortChecked === false) {
      router.push('/briefing-short');
    } else {
      router.push('/questionsshort');
    }
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

  function formatTo2digit(input) {
    let formated = input.toLocaleString('de-DE', {
      minimumIntegerDigits: 2,
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
      questionsStore.timerShortQuestionsRuns = false;
    }
  }

  // let lastShortAnswer = computed(() => {
  //   return questionsStore.lastShortAnswer;
  // });

  // let dateLast = computed(() => {
  //   return dayjs(lastShortAnswer.value);
  // });

  // let dateNext = computed(() => {
  //   return dayjs(dateLast.value).add(30, 'minute');
  // });

  // let lastShortAnswer = '';
  let dateNow = ref({});
  let dateLast = ref({});
  let dateNext = ref({});

  async function initDate() {
    // let lastShortAnswer = await questionsStore.getLastShortAnswer();
    let lastShortAnswer = questionsStore.lastShortAnswer;
    if (lastShortAnswer != undefined) {
      dateNow.value = dayjs();
      dateLast.value = dayjs(lastShortAnswer);
      dateNext.value = dayjs(dateLast.value).add(2, 'minute');
      // minToNext.value = dateNext.value.diff(dateNow.value, 'm');
      secToNext.value = dateNext.value.diff(dateNow.value, 's');
      console.log('Home - timer - lastShortAnswer', lastShortAnswer);
      console.log('Home - timer - dateLast', dateLast.value);
      console.log('Home - timer - dateNext', dateNext.value);
      // timer();

      clearTimeout(secT);
      secTimer();
    }
  }

  onMounted(async () => {
    questionsStore.checkIfInitalAnswerExists();
    initDate();
    // questionsStore.countShortAnswers();
  });
</script>

<style scoped>
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
</style>
