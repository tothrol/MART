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
            <span v-if="infoStore.countdownDays > 0"
              >{{ infoStore.countdownDays }} Tag<span
                v-if="infoStore.countdownDays > 1"
                >en</span
              ></span
            >
            {{ infoStore.countdownHours }} Stunde<span
              v-if="
                infoStore.countdownHours > 1 || infoStore.countdownHours == 0
              "
              >n</span
            >
            und

            {{ infoStore.countdownMinutes }} Minute<span
              v-if="
                infoStore.countdownMinutes > 1 ||
                infoStore.countdownMinutes == 0
              "
              >n</span
            >
          </div>
        </div>
      </div>

      <div
        class="timer_wrapper display_none"
        v-if="infoStore.secToNext >= 1 && questionsStore.todayShortAnswers < 6"
      >
        <div class="timer_text display_none">
          Zeit bis zum nächsten Kurzfragebogen:
        </div>
        <div class="timer">
          <div>{{ minutes }}:{{ seconds }}</div>
        </div>
      </div>

      <div class="timeframe_messages">
        {{ infoStore.timeframeMessage }}
      </div>
      <div class="dailytime_messages" v-if="infoStore.timeframeMessage === ''">
        {{ infoStore.dailyTimeMessage }}
      </div>

      <div class="buttons" v-if="showButtons">
        <ion-button
          @click="onStartQuestionsInitial()"
          v-if="
            questionsStore.initialAnswerExist === false &&
            infoStore.timeframe &&
            infoStore.dailyTime
          "
          >Initialen Fragebogen starten</ion-button
        >

        <ion-button
          @click="infoStore.questionsShortStarted = true"
          v-if="
            userStore.complianceAccepted === true &&
            questionsStore.initialAnswerExist === true &&
            infoStore.timeframe &&
            infoStore.dailyTime
          "
          :disabled="
            infoStore.secToNext >= 1 || questionsStore.todayShortAnswers >= 6
          "
          >Kurzfragebogen starten</ion-button
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
        >Change Fra.</ion-button
      ><ion-button color="medium" @click="showButtons = !showButtons"
        >showButtons</ion-button
      >

      <ion-button
        color="medium"
        @click="questionsStore.nextShortAnswerMs = dayjs().add(5, 'second')"
        >Skip Timer</ion-button
      >
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
        <ion-button
          color="medium"
          @click="questionsStore.nextShortAnswerMs = dayjs().add(15, 'second')"
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

  import dayjs from 'dayjs';

  import router from '@/router';

  const userStore = useUserStore();
  const statsStore = useStatsStore();
  const questionsStore = useQuestionsStore();
  const infoStore = useInfoStore();

  const showButtons = ref(false);

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

  function formatTo2digit(input) {
    let formated = input.toLocaleString('de-DE', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    return formated;
  }

  let minutes = computed(() => {
    return formatTo2digit(Math.floor(infoStore.secToNext / 60));
  });

  let seconds = computed(() => {
    return formatTo2digit(infoStore.secToNext % 60);
  });
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
