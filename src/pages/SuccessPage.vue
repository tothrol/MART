<template>
  <base-layout
    ><div class="box green">
      <Icon class="heart" :icon="heart" />
      <p class="text_big">
        Danke,<br />dass Du dir<br />die Zeit<br />Genommen<br />hast!
      </p>
      <router-link class="link_button" to="/home">
        <ion-button color="secondary">Startseite</ion-button>
      </router-link>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { Icon } from '@iconify/vue';
  import heart from '@iconify-icons/codicon/heart-filled';

  const userStore = useUserStore();
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
