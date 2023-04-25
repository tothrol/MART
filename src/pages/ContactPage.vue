<template>
  <base-layout :fullscreen="false" backgroundColor="primary"
    ><div class="box">
      <h1>{{ infoStore.contactText.title }}</h1>
      <p class="info_text" v-html="infoStore.contactText.text"></p>
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
  import { useStatsStore } from '@/stores/statsStore';
  import router from '@/router';
  import { Storage } from '@ionic/storage';

  const infoStore = useInfoStore();
  const userStore = useUserStore();
  const statsStore = useStatsStore();

  onMounted(() => {
    infoStore.getContactText();
  });
</script>

<style scoped>
  .link {
    color: var(--ion-color-secondary);
    text-decoration: underline;
    cursor: pointer;
  }
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

  .flex_row {
    display: flex;
    flex-direction: row;
  }

  .flex_row input[type='checkbox']:checked + label::before,
  .flex_row input[type='radio']:checked + label::before {
    background: var(--ion-color-secondary);
    /* background: #0a3367ff; */
    box-shadow: inset 0 0 0 2px white;
  }
</style>
