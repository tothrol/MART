<template>
  <base-layout
    :fullscreen="userStore.complianceAccepted === false ? true : false"
    backgroundColor="primary"
    ><div class="box">
      <h1>{{ infoStore.welcomeText.title }}</h1>
      <p class="info_text" v-html="infoStore.welcomeText.text"></p>
      <div class="flex_row" v-if="userStore.complianceAccepted === false">
        <input
          value="true"
          id="compliance"
          type="checkbox"
          v-model="accepted"
        />
        <label for="compliance"></label>
        <div class="compliance_text">
          Ich stimme der <br />
          <span class="link" @click="routing()">Datenschutzverordnung</span>
          zu
        </div>
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
  import { useStatsStore } from '@/stores/statsStore';
  import router from '@/router';
  import { Storage } from '@ionic/storage';

  const infoStore = useInfoStore();
  const userStore = useUserStore();
  const statsStore = useStatsStore();

  onMounted(() => {
    infoStore.getWelcomeText();
  });

  function routing() {
    router.replace({ path: '/compliance' });
  }
  let accepted = ref(false);

  async function accept() {
    userStore.complianceAccepted = true;
    const storage = new Storage();

    await storage.create();
    await storage.set('complianceAccepted', true);

    // await statsStore.checkAndroidPermissions();

    // routing will be handled by BaseLayout watchEffect
    // router.replace('/questionsInitial');
  }
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
