<template>
  <base-layout ref="baseComp" :fullscreen="true">
    <div class="wrapper_h100" ref="myContent">
      <div class="sheets">
        <TransitionGroup name="list"> </TransitionGroup>
      </div>
    </div>

    <div class="development devbox dev" v-if="userStore.showDevbox">
      Development
      <ion-button @click="scroll">2 Top</ion-button>
      <div>
        {{ sheetsRandom }}
        <div
          v-if="activeSheet != undefined && activeSheet.batteryId != undefined"
        >
          <div class="">ItemId: {{ activeSheet.itemId }}</div>
          <div class="">batteryId: {{ activeSheet.batteryId }}</div>
          <div
            class=""
            v-if="batteries[activeSheet.batteryId].batteryName != undefined"
          >
            batteryName: {{ batteries[activeSheet.batteryId].batteryName }}
          </div>
          <div
            class=""
            v-if="batteries[activeSheet.batteryId].batteryMeta != undefined"
          >
            batteryMeta: {{ batteries[activeSheet.batteryId].batteryMeta }}
          </div>

          <div
            class=""
            v-if="batteries[activeSheet.batteryId].batteryMeta != undefined"
          >
            currentSheet: {{ currentSheet }}
          </div>
        </div>

        <ion-button @click="getQuestionsShort"
          >Axios get Questions Short</ion-button
        >
        <ion-button @click="setAllAnswers()">setAllAnswers()</ion-button>
        <ion-button @click="resetAllAnswers()">resetAllAnswers()</ion-button>
      </div>
      <div>answers.entries: {{ answers.entries }}</div>
      <div class="spinner" v-if="showSpinner">
        <ion-spinner name="dots"></ion-spinner>
      </div>
      <div>currentSheet: {{ currentSheet }}</div>
      <input placeholder="currentSheet" type="number" v-model="currentSheet" />
    </div>
    <spinner-component v-if="showSpinner"
      >Daten werden gesendet.</spinner-component
    >
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, inject, watchEffect } from 'vue';
  import { ref, onMounted, computed, defineProps } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import axios from 'axios';
  import { IonSpinner } from '@ionic/vue';
  import SpinnerComponent from '@/components/SpinnerComponent.vue';
  import { useRouter, useRoute } from 'vue-router';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

  // let questions = ref(questionsStore.questionsShort);
  let scales = ref(questionsStore.scalesShort);
  let batteries = ref(questionsStore.batteriesShort);
  let questions = ref(questionsStore.questionsShort);
  let randomScale = ref(userStore.randomArray);

  let answers = reactive({
    entries: { 1: 4, 3: [], 4: [], 6: [] },
    unchangeable: {},
  });

  const baseComp = ref(null);
  function scroll() {
    baseComp.value.scrollTop();
  }

  let errors = ref({});

  let showSpinner = ref(false);

  let currentSheet = ref(0);

  function nextSheet() {
    if (currentSheet.value <= Object.keys(sheets.value).length) {
      currentSheet.value++;

      scroll();
    }
  }

  function previousSheet() {
    if (currentSheet.value > 0) {
      currentSheet.value--;
    }
  }

  onMounted(() => {
    getQuestionsShort();
  });

  function getQuestionsShort() {
    questionsStore.getShortQuestions();
    console.log('QuestionsShortPage on Mounted');
  }

  let sheetsNoRandom = computed(() => {
    return sheets;
  });

  let sheets = computed(() => {
    console.log('QuestionShortPage - SheetsRandom', sheets);

    return 'sheets2';
  });

  // randomizer Function Fisher-Yates
  function shuffle(array) {
    var m = array.length,
      t,
      i;
    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);

      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

  function shuffleFixed(array) {
    var arr = [];
    for (let [key, arrayEntry] of Object.entries(array)) {
      arr.push({ order: userStore.randomArray[key], arrayEntry: arrayEntry });
    }
    arr.sort((a, b) => a.order - b.order); // b - a for reverse sort

    let newArray = [];
    for (let [key, entry] of Object.entries(arr)) {
      newArray.push(entry.arrayEntry);
    }
    return newArray;
  }

  // END randomizer Function Fisher-Yates

  function setAnswer(itemId, value) {
    console.log('QuestionShortPage - setAnswer', itemId, value);
    answers.entries[itemId] = value;
  }

  function setAllAnswers() {
    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionShortPage - setAllAnswers', key, question);
      if (key == 3 || key == 4 || key == 6) {
        answers.entries[key] = [1, 2];
      } else {
        answers.entries[key] = 1;
      }
    }
  }

  function resetAllAnswers() {
    // console.log('QuestionShortPage - setAllAnswers', key, question);

    answers.entries = { 1: 4, 3: [], 4: [], 6: [] };
    answers.unchangeable = {};
    currentSheet.value = 0;
  }

  function sendShortAnswers() {
    showSpinner.value = true;

    questionsStore.sendShortAnswers(answers.entries).then((response) => {
      showSpinner.value = false;

      console.log('QuestionShortPage - sendShortAnswers', response);
      userStore.showShort = false;
      resetAllAnswers();
      router.replace('/success');
    });
  }
</script>

<style>
  option {
    text-align: center;
  }
  .wrapper_h100 {
  }

  .sheets {
  }

  .buttons {
    margin-top: auto;
  }
  .sheet {
    padding: 25px 15px;
    border-radius: 15px;
    background-color: var(--light_light_grey);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    min-height: 94vh;
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
    min-width: 17px;
    min-height: 17px;
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
    /* background: #ddd; */
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
    width: 100%;
  }

  .radio,
  .number {
    width: auto;
    background-color: var(--light_grey);
    margin-bottom: 10px;
    border-radius: 10px;
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-items: center;
    align-items: center;
    line-height: 1;
  }

  .number > input {
    border-radius: 5px;
    border-color: var(--light_grey);
    box-shadow: none !important;
    margin-right: auto;
    margin-left: auto;
    height: 40px;
    width: 100px;
    font-weight: 500;
    color: var(--ion-color-secondary);
    text-align: center;
    background: white;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    width: 100%;

    margin-right: auto;
    margin-left: auto;
  }

  .item_text,
  .battery_text,
  .absenden_text {
    font-size: 20px;
    color: var(--ion-color-primary);
    font-family: 'Roboto-Slab';
    margin-bottom: 20px;
  }

  .missing_text {
    color: var(--ion-color-secondary);
    font-weight: 500;
    font-size: 20px;
  }

  .missing_fields {
    margin-top: 20px;
    margin-bottom: 40px;
  }

  .progress {
    margin-right: auto;
    margin-left: auto;
    color: var(--ion-color-primary);
    width: max-content;
    font-size: 17px;
    margin-top: 0px;
    font-weight: 500;
  }

  body fieldset {
    border: none;
    padding: 10px 0px !important;
  }

  .list-leave-active {
    transition: all 0s ease;
  }
  .list-enter-active {
    transition: all 0.3s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    /* transform: translateX(30px); */
  }

  .timer {
    text-align: center;
    margin-top: 10px;
    font-weight: 500;
    color: var(--ion-color-secondary);
    font-size: 20px;
  }

  .display_none {
    display: none;
  }

  .range_slider {
    width: 80% !important;
  }

  .range_slider_wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .range_slider {
    height: 40px;
  }

  .range_slider_current_value {
    margin-top: 100px;
  }

  .questionOneState {
    margin-right: auto;
    margin-left: auto;
    color: var(--ion-color-secondary);
    font-size: 25px;
    margin-bottom: 10px;

    font-weight: 500;
  }

  /* Input Range */
  input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    /* animate: 0.2s; */
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
    background: var(--ion-color-secondary);
    /* border-radius: 1.3px; */
    /* border: 0.2px solid #010101; */
  }
  input[type='range']::-webkit-slider-thumb {
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
    border: 15px solid #000000;

    height: 36px;
    width: 16px;
    /* border-radius: 3px; */
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -12px;
  }
  input[type='range']:focus::-webkit-slider-runnable-track {
    background: var(--ion-color-secondary);
  }
  input[type='range']::-moz-range-track {
    width: 100%;
    height: 20px;
    cursor: pointer;
    /* animate: 0.2s; */
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
    background: var(--ion-color-secondary);
    /* border-radius: 1.3px; */
    /* border: 0.2px solid #010101; */
  }
  input[type='range']::-moz-range-thumb {
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
    /* border: 1px solid #000000; */
    height: 36px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type='range']::-ms-track {
    width: 100%;
    height: 20px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    /* border-width: 16px 0; */
    color: transparent;
  }
  input[type='range']::-ms-fill-lower {
    /* background: #2a6495; */
    /* border: 0.2px solid #010101; */
    /* border-radius: 2.6px; */
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
  }
  input[type='range']::-ms-fill-upper {
    background: var(--ion-color-secondary);
    /* border: 0.2px solid #010101; */
    /* border-radius: 2.6px; */
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
  }
  input[type='range']::-ms-thumb {
    /* box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; */
    /* border: 1px solid #000000; */
    height: 36px;
    width: 16px;
    /* border-radius: 3px; */
    background: #ffffff;
    cursor: pointer;
  }
  input[type='range']:focus::-ms-fill-lower {
    background: var(--ion-color-secondary);
  }
  input[type='range']:focus::-ms-fill-upper {
    background: var(--ion-color-secondary);
  }

  .question2input {
    height: 40px;
    border-radius: 5px !important;
    background: white;
    margin-left: 10px;
  }

  .dropdown {
    background-color: white;
    margin-left: auto;
    margin-right: auto;
    width: 100px;
    border-radius: 5px;
    height: 30px;
  }

  .no_margin_right {
    margin-right: 0 !important;
  }

  .minuten {
    margin-right: auto;
    margin-left: 5px;
  }

  .grey {
    color: var(--ion-color-medium);
  }

  .radio_fieldset {
    display: flex;
    flex-direction: column;
  }

  .timer3 .timer {
    font-size: 40px;
  }
</style>
