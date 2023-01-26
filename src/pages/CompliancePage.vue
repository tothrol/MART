<template>
  <base-layout
    :fullscreen="userStore.complianceAccepted === false ? true : false"
    backgroundColor="primary"
    ><div class="box">
      <h1>{{ infoStore.compliance.title }}</h1>
      <p class="info_text" v-html="infoStore.compliance.text"></p>

      <ion-button
        @click="onOK"
        v-if="userStore.complianceAccepted === false"
        class="link_button"
        color="secondary"
        >OK</ion-button
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

  const infoStore = useInfoStore();
  const userStore = useUserStore();

  function onOK() {
    router.replace({ path: '/welcome' });
  }

  onMounted(() => {
    infoStore.getCompliance();
  });
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
