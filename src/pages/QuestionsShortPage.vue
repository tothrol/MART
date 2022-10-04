<template>
  <base-layout ref="baseComp" :fullscreen="true">
    <div class="wrapper_h100" ref="myContent">
      <div class="sheets">
        <TransitionGroup name="list">
          <li class="sheet" v-if="currentSheet != Object.keys(sheets).length">
            <div class="progress" v-if="activeSheet.itemId">
              {{ activeSheet.randomOrder }}/{{ Object.keys(questions).length }}
            </div>

            <div class="development">
              <div class="display_none">
                activeSheet:
                {{}}, activeSheet.itemId:
                {{ activeSheet.itemId }}
              </div>
            </div>
            <p class="item_text" v-if="activeSheet.item">
              <span v-html="activeSheet.randomOrder"></span>.
              <span
                style="white-space: pre-line"
                v-html="activeSheet.item"
              ></span>
            </p>
            <!-- <div v-if="activeSheet.item" v-html="activeSheet.item"></div> -->

            <p
              class="battery_text"
              v-if="activeSheet.batteryText"
              v-html="activeSheet.batteryText"
              style="white-space: pre-line"
            ></p>
            <!-- Range  1-7 -->
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
            <!-- ENd Range 1-7 -->
            <!-- Range Slider 0 - 100 -->
            <div
              class="range_slider_wrapper"
              v-if="
                currentScaleMeta &&
                currentScaleMeta[0] === 'slider' &&
                currentScaleMeta[2] == '100'
              "
            >
              <div
                class="display_none"
                v-html="scales[currentScaleId].scaleRepeater[0].key"
              ></div>
              <div class="range_slider_current_value">
                <span
                  class="questionOneState"
                  v-if="answers.entries[activeSheet.itemId] != undefined"
                >
                  {{ answers.entries[activeSheet.itemId] }}%</span
                >
              </div>

              <input
                class="range_slider"
                :id="`${activeSheet.itemId}_${
                  scales[activeSheet.scaleId].scaleRepeater.value
                }`"
                type="range"
                :min="currentScaleMeta[1]"
                :max="currentScaleMeta[2]"
                step="1"
                :name="`${activeSheet.itemId}`"
                v-model="answers.entries[activeSheet.itemId]"
              />
            </div>
            <!-- END Range Slider -->
            <div
              class="radios"
              v-if="
                activeSheet.item &&
                activeSheet.scaleId != 1 &&
                currentScaleMeta[0] != 'multiple' &&
                currentScaleMeta[0] != 'slider'
              "
            >
              <fieldset class="radio_fieldset">
                <div
                  :class="`radio ${activeSheet.scaleId} ${input.value}`"
                  v-for="(input, index) in scales[activeSheet.scaleId]
                    .scaleRepeater"
                  :key="input.value"
                  :style="
                    currentScaleMeta[0] === 'random' ||
                    currentScaleMeta[1] === 'random'
                      ? 'order:' + randomScale[index]
                      : 'order: 1'
                  "
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

                  <!-- Eingabefeld Frage mit radio+manueller eingabe -->

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
            <!-- Multiple radios -->
            <div class="radios" v-if="currentScaleMeta[0] === 'multiple'">
              <fieldset class="radio_fieldset">
                <div
                  :class="`radio ${activeSheet.scaleId} ${input.value}`"
                  v-for="(input, index) in scales[activeSheet.scaleId]
                    .scaleRepeater"
                  :key="input.key"
                  v-show="
                    activeSheet.scaleId !== 10 ||
                    (activeSheet.scaleId === 10 && input.value !== 11)
                  "
                  :style="
                    currentScaleMeta[0] === 'random' ||
                    currentScaleMeta[1] === 'random'
                      ? 'order:' + randomScale[index]
                      : 'order: 1'
                  "
                >
                  <input
                    :id="input.key"
                    type="checkbox"
                    :value="input.value"
                    v-model="answers.entries[activeSheet.itemId]"
                  />

                  <label :for="input.key">{{ input.key }}</label>
                </div>
                <div class="display_none">
                  answers.entries[activeSheet.itemId] :
                  {{ answers.entries[activeSheet.itemId] }}
                </div>
              </fieldset>
            </div>
            <!--END Multiple radios -->
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
                (Object.keys(missingFields).length != 0 &&
                  answers.entries[2] != 2) ||
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
                  answers.entries[1] === '' ||
                  Object.keys(answers.entries).length === 0 ||
                  questionsStore.timerShortQuestionsRuns === true
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
      if (
        activeSheet.value.itemId != undefined &&
        activeSheet.value.itemId == 2 &&
        answers.entries[2] == 2
      ) {
        currentSheet.value = 8;
      } else {
        currentSheet.value++;
      }
      scroll();
    }
  }

  function previousSheet() {
    if (currentSheet.value > 0) {
      if (
        currentSheet.value != undefined &&
        currentSheet.value == 8 &&
        answers.entries[2] == 2
      ) {
        currentSheet.value = 1;
      } else {
        currentSheet.value--;
      }
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

  let sheets = computed(() => {
    console.log('QuestionShortPage - SheetsRandom', sheets);
    console.log('QuestionShortPage - SheetsRandom', sheets.value);
    let sheets2: any = [];
    let sheetsArray: any = [];
    let batteryArray = [];
    let randomBatteryArray = [];

    for (let [index, sheet] of Object.entries(sheetsNoRandom.value)) {
      let currentBatteryId = sheet.batteryId;
      console.log('QuestionShortPage - SheetsRandom -sheet', sheet);

      if (
        batteries.value[currentBatteryId] != undefined &&
        (batteries.value[currentBatteryId].batteryMeta === 'items' ||
          batteries.value[currentBatteryId].batteryMeta === 'items,scale')
      ) {
        batteryArray.push(sheet);

        console.log(
          'QuestionShortPage - SheetsRandom - CHECKKKKKKKKKK',
          sheet.itemId,
          Object.keys(questions.value).length,
          batteryArray
        );

        if (sheet.itemId == Object.keys(questions.value).length) {
          // lastQuestion
          randomBatteryArray = shuffleFixed(batteryArray);
          console.log(
            'QuestionShortPage - SheetsRandom - randomBatteryArray',
            randomBatteryArray,
            batteryArray
          );
          for (let [key, entry] of Object.entries(randomBatteryArray)) {
            // entry.randomOrder = randomOrder;
            console.log(
              'QuestionShortPage - SheetsRandom - entry',
              entry.itemId,
              entry.item.slice(0, 15)
            );
            sheetsArray.push(entry);
            // randomOrder++;
          }
          randomBatteryArray = [];
          batteryArray = [];
        }
      } else {
        sheetsArray.push(sheet);
      }

      let randomOrder = 1;

      for (let [key, sheet] of Object.entries(sheetsArray)) {
        // console.log('QuestionShortPage - key, sheet', key, sheet);
        if (sheet && sheet.item != undefined) {
          // If sheet is an question, give it an randomOrderId
          sheet.randomOrder = randomOrder;
          randomOrder++;
        }

        sheets2[key] = sheet;
      }
    }

    return sheets2;
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

  // scale Meta

  let currentScaleMeta = ref('');

  watchEffect(() => {
    console.log('currentScale', currentScaleId.value);

    if (
      scales.value[currentScaleId.value] != undefined &&
      scales.value[currentScaleId.value].choiceId != undefined &&
      scales.value[currentScaleId.value].choiceId != ''
    ) {
      console.log('currentScale IF', currentScaleId.value);

      currentScaleMeta.value =
        scales.value[currentScaleId.value].choiceId.split(',');
      console.log('currentScaleMeta IF', currentScaleMeta.value);
    } else {
      currentScaleMeta.value = '';
      console.log('currentScaleMeta Else', currentScaleMeta.value);
    }
    if (
      currentScaleMeta.value &&
      currentScaleMeta.value[0] === 'slider' &&
      currentScaleMeta.value[2] == 100 &&
      answers.entries[7] == undefined
    ) {
      console.log('currentScaleMeta ITS Slider');
      answers.entries[activeSheet.value.itemId] = 50;
    }
  });

  // END Scale Meta

  function setAnswer(itemId, value) {
    console.log('QuestionShortPage - setAnswer', itemId, value);
    answers.entries[itemId] = value;
  }

  let missingFields = computed(() => {
    let fields = [];

    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionShortPage - missingFields', key, question);
      if (
        answers.entries[key] === undefined ||
        answers.entries[key] === '' ||
        answers.entries[key].length === 0
      ) {
        if (
          question.scaleId != undefined &&
          scales[question.scaleId] != undefined &&
          scales[question.scaleId].choiceId != undefined &&
          scales[question.scaleId].choiceId != 'multiple' &&
          scales[question.scaleId].choiceId != 'multiple,random'
        )
          fields.push(key);
      }
    }

    return fields;
  });

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
      console.log('How', answer1Value, answer1Plus, activeSheet.value.scaleId);

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
