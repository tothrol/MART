<template>
  <base-layout
    ><div>Hallo {{ userStore.userData.firstname }}</div>
    <div>https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen</div>

    <ion-button @click="getQuestionsInitial"
      >Axios get Questions Initial</ion-button
    >
    <div class="sheets">
      <div class="sheet" v-for="(sheet, key) in sheets" :key="key">
        <p class="item_text" v-if="sheet.item">
          <span v-html="sheet.itemId"></span>.
          <span v-html="sheet.item"></span>
        </p>

        <p
          class="battery_text"
          v-if="sheet.batteryText"
          v-html="sheet.batteryText"
        ></p>
        <div class="radios" v-if="sheet.item">
          <fieldset>
            <div
              class="radio"
              v-for="input in scales[sheet.scaleId].scaleRepeater"
              :key="input.value"
            >
              <input
                :id="`${sheet.itemId}_${scales[sheet.scaleId].scaleId}_${
                  input.value
                }`"
                type="radio"
                :name="`${sheet.itemId}_${scales[sheet.scaleId].scaleId}`"
              />
              <label
                :for="`${sheet.itemId}_${scales[sheet.scaleId].scaleId}_${
                  input.value
                }`"
                >{{ input.key }}</label
              >
            </div>
          </fieldset>
        </div>
        <div class="buttons">
          <ion-button color="primary">weiter</ion-button
          ><ion-button color="tertiary">zurück</ion-button>
        </div>
        <div class="progress" v-if="sheet.itemId">
          {{ sheet.itemId }}/{{ Object.keys(questions).length }}
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
  let questions = ref(questionsStore.questionsInitial);

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
      console.log('QuestionInitialPage - question', question);
      let currentBatteryId = question.batteryId;
      if (lastBatteryId != currentBatteryId) {
        sheetsArray.push(batteries.value[currentBatteryId]);
      }
      sheetsArray.push(question);
      lastBatteryId = currentBatteryId;
    }

    for (let [key, sheet] of Object.entries(sheetsArray)) {
      console.log('QuestionInitialPage - key, sheet', key, sheet);
      sheets[key] = sheet;
    }

    console.log('QuestionInitialPage - sheets', sheets);

    return sheets;
  });
</script>

<style scoped>
  .sheet {
    padding: 25px 15px;
    border-radius: 15px;
    background-color: var(--light_light_grey);
    margin-bottom: 20px;
  }
  .radios {
    display: flex;
    flex-direction: column;
  }

  .radio input {
    appearance: none;
    border: none;
    border-radius: 0;
    font-size: 1em;
    width: 100%;
  }

  /* graceful degradation for ie8 */
  input[type='checkbox'],
  input[type='radio'] {
    width: auto;
    float: left;
    margin-right: 0.75em;
    background: transparent;
    border: none;
  }

  input[type='checkbox']:checked,
  input[type='checkbox']:not(:checked),
  input[type='radio']:checked,
  input[type='radio']:not(:checked) {
    background: transparent;
    position: relative;
    visibility: hidden;
    margin: 0;
    padding: 0;
  }

  input[type='checkbox'] + label,
  input[type='radio'] + label {
    cursor: pointer;
  }

  input[type='checkbox']:checked + label::before,
  input[type='checkbox']:not(:checked) + label::before,
  input[type='radio']:checked + label::before,
  input[type='radio']:not(:checked) + label::before {
    content: ' ';
    display: inline-block;
    width: 17px;
    height: 17px;
    position: relative;

    border: 1px solid #bbb;
    background: white;
    margin-right: 1em;
    box-shadow: inset 0 1px 1px 0 rgba(0, 0, 0, 0.1);
  }

  input[type='radio']:checked + label::before,
  input[type='radio']:not(:checked) + label::before {
    border-radius: 30px;
  }

  input[type='checkbox']:hover + label::before,
  input[type='radio']:hover + label::before {
    background: #ddd;
    box-shadow: inset 0 0 0 2px white;
  }

  input[type='checkbox']:checked + label::before,
  input[type='radio']:checked + label::before {
    background: var(--ion-color-primary);
    /* background: #0a3367ff; */
    box-shadow: inset 0 0 0 2px white;
  }

  .radio input {
    margin-right: 15px;
    /* color: var(--ion-color-secondary); */
  }
  .radio label {
    color: var(--ion-color-secondary);
    font-weight: 500;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-items: center;
    align-items: center;
    line-height: 1;
  }

  .radio {
    width: auto;
    background-color: var(--light_grey);
    margin-bottom: 15px;
    border-radius: 10px;
    padding: 15px 10px;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-items: center;
    align-items: center;
    line-height: 1;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    max-width: 300px;

    margin-right: auto;
    margin-left: auto;
  }

  .buttons > ion-button {
    --border-radius: 25px;
    text-transform: none;
    --box-shadow: var(--box_shadow);
    height: 50px;
  }

  .item_text,
  .battery_text {
    font-size: 25px;
    color: var(--ion-color-primary);
    font-family: 'Roboto-Slab';
  }

  .progress {
    margin-right: auto;
    margin-left: auto;
    color: var(--ion-color-primary);
    width: max-content;
    font-size: 17px;
    margin-top: 20px;
    font-weight: 500;
  }

  fieldset {
    border: none;
  }
</style>
