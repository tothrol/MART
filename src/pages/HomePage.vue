<template>
  <base-layout>
    <div class="box">
      <div class="info">
        <div class="uiqueUserId">
          ID: <span class="big">{{ userStore.uniqueUserId }}</span>
        </div>
        <div class="total_nr_answers">
          Insgesamt ausgefüllte Kurzfragebögen:
          <span class="big">{{ questionsStore.totalShortAnswers }}</span>
        </div>
        <div class="today_nr_answers display_none">
          Heute ausgefüllte Kurzfragebögen:
          <span class="big">{{ questionsStore.todayShortAnswers }}/7</span>
        </div>
      </div>
      <div>
        <div class="countdown">
          <div v-if="infoStore.countdownTotalMinutes < 0">
            Vielen Dank für Ihre Teilnahme! Die Studie ist hiermit beendet und
            Sie dürfen MART nun gern deinstallieren. Sie werden bald darüber
            informiert, wie hoch die Entschädigung für Ihre Teilnahme ist.
          </div>
          <div
            v-if="
              infoStore.countdownTotalMinutes >= 0 &&
              questionsStore.initialAnswerExist
            "
          >
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
      </div>

      <div class="timeframe_messages">
        {{ infoStore.timeframeMessage }}
      </div>
      <div class="dailytime_messages" v-if="infoStore.timeframeMessage === ''">
        {{ infoStore.dailyTimeMessage }}
      </div>

      <div
        class="buttons"
        v-if="userStore.showAdminButtonsHome || platform === 'web'"
      >
        <ion-button @click="onStartQuestionsInitial()"
          >Initialen Fragebogen starten</ion-button
        >

        <!-- <ion-button @click="onStartQuestionsTest()"
          >Test Fragebogen starten</ion-button
        > -->

        <ion-button @click="onStartQuestionsShort()"
          >Kurzfragebogen starten</ion-button
        >

        <div
          class="result_buttons"
          v-if="
            userStore.userData.username === 'nviiadmin' ||
            userStore.userData.username === 'RolandToth'
          "
        >
          <router-link class="link_button" to="/answersInitial">
            <ion-button color="medium">Antworten Initialfragebogen</ion-button>
          </router-link>
          <router-link class="link_button" to="/answersShort">
            <ion-button color="medium">Antworten Kurzfragebogen</ion-button>
          </router-link>
          <router-link class="link_button" to="/statistics">
            <ion-button color="medium">Nutzungsstatistiken</ion-button>
          </router-link>
          <router-link class="link_button" to="/device-stats">
            <ion-button color="medium">Device Stats</ion-button>
          </router-link>
        </div>
      </div>
      <Infoboxhome-Component></Infoboxhome-Component>
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
  import InfoboxhomeComponent from '@/components/InfoboxhomeComponent.vue';
  import { Capacitor } from '@capacitor/core';
  import { Storage } from '@ionic/storage';

  import dayjs from 'dayjs';

  import router from '@/router';

  const userStore = useUserStore();
  const statsStore = useStatsStore();
  const questionsStore = useQuestionsStore();
  const infoStore = useInfoStore();
  let platform = Capacitor.getPlatform();

  const showButtons = ref(false);

  function onStartQuestionsShort() {
    router.replace({ path: '/questionsshort' });
  }

  async function sendFinalStats() {
    console.log('Home - sendFinalStats');

    // START TEST
    // let test = true;
    // END TEST
    if (infoStore.countdownTotalMinutes < 0) {
      const storage = new Storage();
      await storage.create();
      let storeageSendFinalStats = await storage.get('sendFinalStats');
      console.log(
        'Home - sendFinalStats - storeageSendFinalStats:',
        storeageSendFinalStats
      );
      if (storeageSendFinalStats != true) {
        console.log('Home - sendFinalStats - beforeSend:');
        const now = dayjs();
        const today = now.format('DD.MM.YYYY');
        const time = now.format('HH:mm');
        const dateLong = now.format();
        const timestamp = now.valueOf();
        await statsStore.getStats(today, time, dateLong, timestamp);

        await storage.create();
        await storage.set('sendFinalStats', true);

        // console.log('Devbox - getEventStatsStore - result:', result);
      }
    }
  }
  sendFinalStats();

  async function onStartQuestionsInitial() {
    // check for validToken
    let answer = await userStore.validateToken(userStore.userData.token);
    console.log('Home await validateToken - answer', answer);
    if (answer.code === 'ERR_NETWORK') {
      userStore.appMessage2 =
        'Bitte stellen Sie sicher das eine Internetverbindung besteht!';
      userStore.showAppMessage2 = true;
      return;
    } else if (answer.status != 200 && answer.status != 201) {
      userStore.appMessage2 =
        'Bitte melden Sie sich erneut an! <br><br> Code: ' +
        answer.code +
        '<br>Message:' +
        answer.message +
        '';
      userStore.showAppMessage2 = true;

      router.replace({ path: '/login' });
      return;
    }

    // end check for validTokenminutes

    router.replace({ path: '/questionsinitial' });
  }

  async function onStartQuestionsTest() {
    // // check for validToken
    // let answer = await userStore.validateToken(userStore.userData.token);
    // console.log('Home await validateToken - answer', answer);
    // if (answer.code === 'ERR_NETWORK') {
    //   userStore.appMessage2 =
    //     'Bitte stellen Sie sicher das eine Internetverbindung besteht!';
    //   userStore.showAppMessage2 = true;
    //   return;
    // } else if (answer.status != 200 && answer.status != 201) {
    //   userStore.appMessage2 =
    //     'Bitte melden Sie sich erneut an! <br><br> Code: ' +
    //     answer.code +
    //     '<br>Message:' +
    //     answer.message +
    //     '';
    //   userStore.showAppMessage2 = true;

    //   router.replace({ path: '/login' });
    //   return;
    // }

    // end check for validTokenminutes

    router.replace({ path: '/questionstest' });
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
    margin-top: 50px;
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
    text-align: center;
  }

  .result_buttons {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
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

  .link_button {
    margin-right: auto;
    margin-left: auto;
  }
</style>
