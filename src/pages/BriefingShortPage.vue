<template>
  <base-layout
    backgroundColor="primary"
    :fullscreen="userStore.briefingShortChecked === false ? true : false"
    ><div class="box">
      <div v-if="userStore.briefingShortChecked === false">
        <h1>{{ infoStore.briefingShort.title }}</h1>
        <p class="info_text" v-html="infoStore.briefingShort.text"></p>
      </div>

      <div v-if="userStore.briefingShortChecked === true">
        <h1>{{ infoStore.briefingShortMenu.title }}</h1>
        <p class="info_text" v-html="infoStore.briefingShortMenu.text"></p>
      </div>

      <ion-button
        v-if="userStore.briefingShortChecked === false"
        @click="checkBriefing()"
        color="secondary"
        >Weiter</ion-button
      >
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useInfoStore } from '@/stores/infoStore';
  import { Icon } from '@iconify/vue';
  import heart from '@iconify-icons/codicon/heart-filled';
  import { useUserStore } from '@/stores/userStore';
  import router from '@/router';
  import { Storage } from '@ionic/storage';

  const infoStore = useInfoStore();
  const userStore = useUserStore();

  onMounted(() => {
    infoStore.getBriefingShort();
    infoStore.getBriefingShortMenu();
  });

  async function checkBriefing() {
    userStore.briefingShortChecked = true;
    userStore.setNotifications();
    const storage = new Storage();
    await storage.create();
    await storage.set('briefingShortChecked', true);

    console.log('BriefingShortPage - checkBriefing');
    router.replace({ path: '/home' });
  }
</script>

<style scoped>
  .heart {
    color: white;
  }

  ion-button {
    margin-top: 50px;
  }

  .box svg {
    color: white;
    /* size: 50px; */
    /* width: 50px;
    height: 50px; */
    font-size: 40px;
  }

  h1 {
    text-align: center;
  }
</style>
