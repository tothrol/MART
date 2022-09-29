<template>
  <base-layout
    :fullscreen="userStore.complianceAccepted === false ? true : false"
    ><div class="box green">
      <h1>{{ infoStore.welcomeText.title }}</h1>
      <p class="info_text" v-html="infoStore.welcomeText.text"></p>
      <div v-if="userStore.complianceAccepted === false">
        <input
          value="true"
          id="compliance"
          type="checkbox"
          v-model="accepted"
        />
        <label for="compliance"
          >Ich stimme der
          <router-link to="/compliance">Datenschutzverordnung</router-link>
          zu</label
        >
      </div>

      <ion-button
        v-if="userStore.complianceAccepted === false"
        :disabled="accepted != true"
        @click="accept()"
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
  import { Storage } from '@ionic/storage';

  const infoStore = useInfoStore();
  const userStore = useUserStore();

  onMounted(() => {
    infoStore.getWelcomeText();
  });

  let accepted = ref(false);

  async function accept() {
    userStore.complianceAccepted = true;
    const storage = new Storage();

    await storage.create();
    await storage.set('complianceAccepted', true);
    router.push('/questionsInitial');
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
