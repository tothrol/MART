<template>
  <base-layout
    ><div class="box blue">
      <router-link to="/questionsinitial" v-if="userStore.showInitial">
        <ion-button>Initialen Fragebogen starten</ion-button>
      </router-link>
      <router-link to="/questionsShort" v-if="userStore.showQuestions">
        <ion-button>Fragebogen starten</ion-button>
      </router-link>
      <router-link to="/answers">
        <ion-button color="medium">Auswertung ansehen</ion-button>
      </router-link>
    </div>
    <Transition>
      <MessageboxComponent v-if="showMessage" @click="showMessage = false"
        >Here is a message</MessageboxComponent
      >
    </Transition>
    <div class="devbox" v-if="userStore.showDevbox">
      <ion-button
        color="medium"
        @click="userStore.showInitial = !userStore.showInitial"
        >Toggel showInitial</ion-button
      >{{ userStore.showInitial }}

      <ion-button
        color="medium"
        @click="questionsStore.checkIfInitalAnswerExists"
        >checkIfInitalAnswersExists</ion-button
      >{{ userStore.showInitial }}
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import messageBoxComponent from '@/components/MessageboxComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();

  let showMessage = ref(false);

  onMounted(() => {
    questionsStore.checkIfInitalAnswerExists();
  });
</script>
