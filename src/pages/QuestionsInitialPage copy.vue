<template>
  <base-layout
    ><div>Hallo {{ userStore.userData.firstname }}</div>
    <div>https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen</div>

    <ion-button @click="getQuestionsInitial"
      >Axios get Questions Initial</ion-button
    >
    <div class="sheets">
      <div class="sheet" v-for="[key, sheet] of sheets" :key="key">
        <p v-if="sheet.item">{{ sheet.item }}</p>
        <p v-if="sheet.batteryText">{{ sheet.batteryText }}</p>
        <div class="radios" v-if="sheet.item">
          <div
            class="radio"
            v-for="input in scales[question.scaleId].scaleRepeater"
            :key="input.value"
          >
            <label :for="input.key">{{ input.key }}</label>
            <input :id="input.key" type="radio" />
          </div>
        </div>
      </div>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import axios from 'axios';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();

  // let questions = ref(questionsStore.questionsInitial);
  let scales = ref(questionsStore.scalesInitial);
  let batteries = ref(questionsStore.batteriesInitial);

  let errors = ref({});

  function getQuestionsInitial() {
    questionsStore.getInitialQuestions();
  }

  let sheets = computed(() => {
    let sheetsArray: any = [];
    let sheets: any = {};

    let lastBatteryId = 1;

    for (let [key, question] of Object.entries(
      questionsStore.questionsInitial
    )) {
      let currentBatteryId = question.batteryId;
      console.log(
        'QuestionInitialPage - current / last',
        currentBatteryId,
        lastBatteryId
      );
      console.log('QuestionInitialPage - question', question);

      if (lastBatteryId != currentBatteryId) {
        console.log(
          'QuestionInitialPage - batteries.value[currentBatteryId]',
          batteries.value[currentBatteryId]
        );
        sheetsArray.push(batteries.value[currentBatteryId]);
      }
      sheetsArray.push(question);
      lastBatteryId = currentBatteryId;
    }

    for (let [key, sheet] of Object.entries(sheetsArray)) {
      sheets[key] = sheet;
    }

    console.log('QuestionInitialPage - sheet', sheets);

    return sheets;
  });
</script>
