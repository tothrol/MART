<template>
  <base-layout
    ><div class="box green">
      <Icon class="heart" :icon="heart" />
      <p class="text_big">
        Danke,<br />dass Sie sich<br />die Zeit<br />genommen<br />haben!
      </p>

      <ion-button color="secondary" @click="onStartseite"
        >Startseite</ion-button
      >
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { Icon } from '@iconify/vue';
  import heart from '@iconify-icons/codicon/heart-filled';
  import router from '@/router';

  const userStore = useUserStore();

  function onStartseite() {
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
</style>
