<template>
  <base-layout
    ><div class="box green">
      <h1>{{ infoStore.briefingShort.title }}</h1>
      <p class="info_text" v-html="infoStore.briefingShort.text"></p>

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
  });

  async function checkBriefing() {
    userStore.briefingShortChecked = true;
    const storage = new Storage();

    await storage.create();
    await storage.set('briefingShortChecked', true);
    router.push('/questionsshort');
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
</style>
