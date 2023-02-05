<template>
  <div v-if="userStore.userData.username === 'nviiadmin'">
    <div
      class="dev_button admin"
      @click="userStore.showDevbox = !userStore.showDevbox"
    >
      <ion-button color="medium">dev</ion-button>
    </div>
    <div class="devbox" v-if="userStore.showDevbox">
      <div class="next_notifications">
        Next Intervals:
        <div
          class="notification_times"
          v-for="notification of userStore.notificationTimes.slice(0, 5)"
          :key="notification"
        >
          {{ dayjs(notification).format('DD.MM.YY HH:mm') }}
        </div>
      </div>
      <div class="next_notifications">
        Next Notifications Random:
        <div
          class="notification_times"
          v-for="notification of userStore.notificationTimesRandom.slice(0, 5)"
          :key="notification"
        >
          {{ dayjs(notification).format('DD.MM.YY HH:mm') }}
        </div>
      </div>
      <br />
      <div class="timer_text">Time to next Interval:</div>
      <div class="timer">
        <div>{{ minutes }}:{{ seconds }}</div>
      </div>

      <div>
        secToNext: {{ infoStore.secToNext }}<br />
        minutesCounter:
        {{ infoStore.minutesCounter }}
        <div>
          <div>
            questionsStore.shortAnswersArray.length:
            {{ questionsStore.shortAnswersArray.length }}
          </div>
          <br />
          route.path: {{ route.path }} <br /><br />
          infoStore.appStateChangeCounter:
          {{ infoStore.appStateChangeCounter }} <br /><br />
          <div>
            infoStore.countdownTimerCounter:
            {{ infoStore.countdownTimerCounter }}
          </div>

          initialAnswerExist: {{ questionsStore.initialAnswerExist }}<br />
          infoStore.dailyTime: {{ infoStore.dailyTime }}<br />
          infoStore.timeframe: {{ infoStore.timeframe }}<br />
          userStore.briefingShortChecked:
          {{ userStore.briefingShortChecked }}<br />
          userStore.complianceAccepted: {{ userStore.complianceAccepted }}<br />
          questionsStore.todayShortAnswers:
          {{ questionsStore.todayShortAnswers }}<br /><br />
          infoStore.conditionsQuestionsShort:
          {{ infoStore.conditionsQuestionsShort }}<br /><br />
          <div>
            userStore.userData.token: {{ userStore.userData.token.slice(0, 5) }}
          </div>
          <div>
            userStore.userData.username: {{ userStore.userData.username }}
          </div>

          infoStore.startDate:
          {{ infoStore.startDate }} <br /><br />
          infoStore.endDate:
          {{ infoStore.endDate }} <br />
          <br /><br />infoStore.dailyStartTime:
          {{ infoStore.dailyStartTime }}
          <br /><br />infoStore.dailyEndTime: {{ infoStore.dailyEndTime
          }}<br /><br />
          infoStore.dailyInterval: {{ infoStore.dailyInterval }}<br /><br />
          infoStore.breakBetweenShortQuestions:
          {{ infoStore.breakBetweenShortQuestions }}<br /><br />
          infoStore.datesAndTimes:
          {{ infoStore.datesAndTimes }}<br /><br />
        </div>
        <div>
          pendingNotificationsCount: {{ infoStore.pendingNotificationsCount }}
        </div>
        <div>
          userStore.startOfThisInterval: {{ userStore.startOfThisInterval }}
        </div>
        <div>
          userStore.endOfThisInterval: {{ userStore.endOfThisInterval }}
        </div>
        <div>
          userStore.startOfIntervalsRandomNotification:
          {{ userStore.startOfIntervalsRandomNotification }}
        </div>
        <div>
          userStore.conditionInterval
          {{ userStore.conditionInterval }}
        </div>
        <br />
        <router-link class="link_button" to="/iosstats">
          <ion-button color="medium">iosStats</ion-button>
        </router-link>
        <ion-button color="medium" @click="questionsStore.countShortAnswers()"
          >countShortAnswers</ion-button
        >

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
        <router-link class="link_button" to="/questionsshort">
          <ion-button
            >Kurzfragebogen starten router-link</ion-button
          ></router-link
        ><ion-button @click="userStore.getPendingNotifications"
          >get Pending Notific.</ion-button
        ><ion-button @click="infoStore.dailyTime = !infoStore.dailyTime"
          >infoStore.dailyTime Toggle</ion-button
        ><ion-button @click="userStore.validateToken(userStore.userData.token)"
          >userStore.validateToken</ion-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
  import dayjs from 'dayjs';
  import { useUserStore } from '@/stores/userStore';
  import { useInfoStore } from '@/stores/infoStore';
  import { useStatsStore } from '@/stores/statsStore';
  import { computed } from 'vue';

  import { useQuestionsStore } from '@/stores/questionsStore';
  import { useRouter, useRoute } from 'vue-router';

  const questionsStore = useQuestionsStore();
  const userStore = useUserStore();
  const infoStore = useInfoStore();
  const statsStore = useStatsStore();

  const route = useRoute();

  // START devbox

  let minutes = computed(() => {
    return formatTo2digit(Math.floor(infoStore.secToNext / 60));
  });

  console.log('BaseMinutes', minutes);

  let seconds = computed(() => {
    return formatTo2digit(infoStore.secToNext % 60);
  });
  console.log('seconds', seconds);

  function formatTo2digit(input) {
    let formated = input.toLocaleString('de-DE', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    return formated;
  }
  // END devbox
</script>

<style scoped>
  .devbox {
    color: black;
  }

  .dev_button {
    position: absolute;
    bottom: 0px;
    right: 10px;
    z-index: 9999;
  }
</style>
