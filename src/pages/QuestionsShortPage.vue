<template>
  <base-layout ref="baseComp">
    <div class="wrapper_h100" ref="myContent">
      <div class="sheets">
        <TransitionGroup name="list">
          <li class="sheet" v-if="currentSheet != Object.keys(sheets).length">
            <div class="progress" v-if="activeSheet.itemId">
              {{ activeSheet.itemId }}/{{ Object.keys(questions).length }}
            </div>

            <div class="development">
              <div class="display_none">
                activeSheet:
                {{}}, activeSheet.itemId:
                {{ activeSheet.itemId }}
              </div>
            </div>
            <p class="item_text" v-if="activeSheet.item">
              <span v-html="activeSheet.itemId"></span>.
              <span v-html="activeSheet.item"></span>
            </p>

            <p
              class="battery_text"
              v-if="activeSheet.batteryText"
              v-html="activeSheet.batteryText"
            ></p>
            <div
              class="range_slider_wrapper"
              v-if="activeSheet.item && activeSheet.scaleId === 1"
            >
              <span
                class="questionOneState"
                v-if="answers.entries[1] != undefined"
              >
                {{ questionOneState }}</span
              >

              <input
                class="range_slider"
                :id="`${activeSheet.itemId}_${
                  scales[activeSheet.scaleId].scaleRepeater.value
                }`"
                type="range"
                min="1"
                max="7"
                step="1"
                :name="`${activeSheet.itemId}`"
                v-model="answers.entries[1]"
              />
            </div>
            <div
              class="radios"
              v-if="activeSheet.item && activeSheet.scaleId != 1"
            >
              <fieldset>
                <div
                  :class="`radio ${activeSheet.scaleId} ${input.value}`"
                  v-for="input in scales[activeSheet.scaleId].scaleRepeater"
                  :key="input.value"
                >
                  <input
                    v-if="
                      activeSheet.itemId != 2 ||
                      (activeSheet.itemId == 2 && input.value != '')
                    "
                    :id="`${activeSheet.itemId}_${input.value}`"
                    type="radio"
                    :value="input.value"
                    v-model="answers.entries[activeSheet.itemId]"
                    :disabled="disableInput"
                  />

                  <label
                    v-if="
                      activeSheet.itemId != 2 ||
                      (activeSheet.itemId == 2 && input.value != '')
                    "
                    :for="`${activeSheet.itemId}_${input.value}`"
                    >{{ input.key }}</label
                  >

                  <!-- Eingabefeld Frage 2 -->

                  <input
                    class="question2input8"
                    @click="setQuestion2input()"
                    v-if="activeSheet.itemId == 2 && input.value == ''"
                    :id="`${activeSheet.itemId}_${input.value}`"
                    type="radio"
                    :disabled="disableInput"
                    :value="question2inputValue"
                    v-model="answers.entries[activeSheet.itemId]"
                  />

                  <label
                    v-if="activeSheet.itemId == 2 && input.value == ''"
                    :for="`${activeSheet.itemId}_${input.value}`"
                    >{{ input.key }}</label
                  >

                  <input
                    :id="`${activeSheet.itemId}_${input.value}`"
                    class="question2input"
                    v-if="activeSheet.itemId == 2 && input.value == ''"
                    type="text"
                    @input="question2input($event.target.value)"
                    :disabled="disableInput"
                    v-model="question2inputValue"
                  />

                  <!-- End Eingabefeld Frage 2 -->
                </div>
                <input class="testinput" id="t" type="radio" value="1" />

                <div class="display_none">
                  answers.entries[activeSheet.itemId] :
                  {{ answers.entries[activeSheet.itemId] }}
                </div>
              </fieldset>
            </div>
            <div class="buttons">
              <ion-button
                @click="nextSheet()"
                color="primary"
                :disabled="
                  (answers.entries[activeSheet.itemId] === '' ||
                    answers.entries[activeSheet.itemId] === undefined) &&
                  activeSheet.batteryText === undefined
                "
                >weiter</ion-button
              ><ion-button
                @click="previousSheet()"
                v-if="activeSheet.itemId != 1"
                color="tertiary"
                :disabled="disablePreviousButton"
                >zurück</ion-button
              >
            </div>
          </li>
          <li class="sheet" v-if="currentSheet == Object.keys(sheets).length">
            <div class="absenden_text">Bereit zum Absenden?</div>
            <div
              class="missing_text"
              v-if="
                Object.keys(missingFields).length != 0 ||
                answers.entries[1] === ''
              "
            >
              Es fehlen Angaben zu folgenden Fragen:

              <div class="missing_fields">
                <span
                  class="missing_field"
                  v-for="(key, field) of missingFields"
                  :key="field"
                >
                  {{ key
                  }}<span
                    v-if="field != Object.entries(missingFields).length - 1"
                    >,
                  </span>
                </span>
              </div>
            </div>
            <div class="buttons">
              <ion-button
                color="primary"
                @click="sendShortAnswers()"
                :disabled="
                  Object.keys(questions).length !=
                    Object.keys(answers.entries).length ||
                  answers.entries[1] === '' ||
                  Object.keys(answers.entries).length === 0
                "
                >Fragebogen absenden</ion-button
              ><ion-button @click="previousSheet()" color="tertiary"
                >zurück</ion-button
              >
            </div>
          </li>
        </TransitionGroup>
      </div>
    </div>

    <div class="development devbox dev" v-if="userStore.showDevbox">
      Development
      <ion-button @click="scroll">2 Top</ion-button>
      <div>
        <div>https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen</div>

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

  let answers = reactive({ entries: { 1: 4 }, unchangeable: {} });

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
    currentSheet.value > 0 && currentSheet.value--;
  }

  onMounted(() => {
    getQuestionsShort();
  });

  function getQuestionsShort() {
    questionsStore.getShortQuestions();
    console.log('QuestionsShortPage on Mounted');
  }

  let sheets = computed(() => {
    let sheetsArray: any = [];
    let sheets: any = {};

    let lastBatteryId = 1;

    for (let [key, question] of Object.entries(questionsStore.questionsShort)) {
      // console.log('QuestionShortPage - question', question);
      let currentBatteryId = question.batteryId;
      if (
        lastBatteryId != currentBatteryId &&
        batteries.value[question.batteryId].batteryText != ''
      ) {
        sheetsArray.push(batteries.value[currentBatteryId]);
      }
      sheetsArray.push(question);
      lastBatteryId = currentBatteryId;
    }

    for (let [key, sheet] of Object.entries(sheetsArray)) {
      // console.log('QuestionShortPage - key, sheet', key, sheet);

      sheets[key] = sheet;
    }
    // console.log('QuestionShortPage - sheets', sheets);

    return sheets;
  });

  let activeSheet = computed(() => {
    let activeSheet: any = {};

    for (let [key, sheet] of Object.entries(sheets.value)) {
      if (key == currentSheet.value) {
        // This If Statement ensures that only the active enty is in the activeSheet object
        activeSheet = sheet;
      }
    }

    return activeSheet;
  });

  let currentScaleId = computed(() => {
    let currentScale = activeSheet.value.scaleId;

    return currentScale;
  });

  function setAnswer(itemId, value) {
    console.log('QuestionShortPage - setAnswer', itemId, value);
    answers.entries[itemId] = value;
  }

  let missingFields = computed(() => {
    let fields = [];

    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionShortPage - missingFields', key, question);
      if (answers.entries[key] === undefined || answers.entries[key] === '') {
        fields.push(key);
      }
    }

    return fields;
  });

  function setAllAnswers() {
    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionShortPage - setAllAnswers', key, question);
      answers.entries[key] = 1;
    }
  }

  function resetAllAnswers() {
    // console.log('QuestionShortPage - setAllAnswers', key, question);
    answers.entries = { 1: 4 };
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
      router.push('/success');
    });
  }

  let disableInput = computed(() => {
    return false;
  });

  let disablePreviousButton = computed(() => {
    return false;
  });

  let questionOneState = computed(() => {
    let answer1Value = answers.entries[1];
    if (answer1Value != undefined && currentSheet.value == 0) {
      let answer1Plus = parseInt(answer1Value) - 1;
      // console.log('How', answer1Value, answer1Plus, activeSheet.value.scaleId);

      return scales.value[activeSheet.value.scaleId].scaleRepeater[answer1Plus]
        .key;
    } else return '';
  });

  function question2input(value) {
    console.log('question2', value);
    answers.entries[2] = value;
    question2inputValue.value = value;
  }

  let question2inputValue = ref('');

  function setQuestion2input() {
    console.log('setQuestion2input');
    answers.entries[2] = question2inputValue.value;
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
    min-height: 80vh;
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
</style>
