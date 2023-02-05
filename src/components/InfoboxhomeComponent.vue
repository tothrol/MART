<template>
  <div
    v-if="
      userStore.userData.username === 'nviiadmin' ||
      userStore.userData.username === 'RolandToth'
    "
  >
    <!--START Buttons -->
    <div class="adminbox">
      <ion-button
        color="medium"
        @click="userStore.showInfoboxHome = !userStore.showInfoboxHome"
        >info</ion-button
      >

      <ion-button
        color="medium"
        @click="
          userStore.showAdminButtonsHome = !userStore.showAdminButtonsHome
        "
        >showButtons</ion-button
      >

      <router-link class="link_button" to="/iosstats">
        <ion-button color="medium">iOS Stats</ion-button>
      </router-link>
    </div>
    <!--END Buttons -->

    <div class="devbox" v-if="userStore.showInfoboxHome">
      <div class="next_notifications">
        Next Intervals:
        <div
          class="notification_times"
          v-for="notification of userStore.notificationTimes.slice(0, 10)"
          :key="notification"
        >
          {{ dayjs(notification).format('DD.MM.YY HH:mm') }}
        </div>
      </div>
      <div class="next_notifications">
        Next Notifications:
        <div
          class="notification_times"
          v-for="notification of userStore.notificationTimesRandom.slice(0, 10)"
          :key="notification"
        >
          {{ dayjs(notification).format('DD.MM.YY HH:mm') }}
        </div>
      </div>
      <br />
    </div>
  </div>
</template>

<script setup>
  import dayjs from 'dayjs';
  import { useUserStore } from '@/stores/userStore';
  import { useInfoStore } from '@/stores/infoStore';
  import { useStatsStore } from '@/stores/statsStore';

  import { useQuestionsStore } from '@/stores/questionsStore';
  import { useRouter, useRoute } from 'vue-router';
  import { computed } from 'vue';

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
  .adminbox {
    position: fixed;
    bottom: 0;
    left: 0;
  }
  .devbox {
    color: black;
  }

  .dev_button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
  }
</style>
