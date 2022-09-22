<template>
  <base-layout ref="baseComp">
    <div class="wrapper_h100">
      <div class="sheets">
        <TransitionGroup name="list">
          <li class="sheet" v-if="currentSheet != Object.keys(sheets).length">
            <div class="progress" v-if="activeSheet.item">
              {{ activeSheet.itemId }}/{{ Object.keys(questions).length }}
            </div>
            <div class="timer" v-if="showTimer">
              Timer: {{ time.toFixed(1) }}
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
            <p
              class="battery_text"
              v-if="activeSheet.text"
              v-html="activeSheet.text"
            ></p>
            <div
              class="number"
              v-if="currentScaleMeta && currentScaleMeta[0] === 'dropdown'"
            >
              <select
                class="dropdown"
                :id="`${activeSheet.itemId}_${
                  scales[activeSheet.scaleId].scaleRepeater.value
                }`"
                type="number"
                :name="`${activeSheet.itemId}`"
                v-model="answers.entries[activeSheet.scaleId]"
              >
                <option v-for="n in getRange(1900, 2010)" :key="n">
                  {{ n }}
                </option>
              </select>
            </div>
            <div
              class="number"
              v-if="currentScaleMeta && currentScaleMeta[0] === 'number'"
            >
              <input
                :class="activeSheet.itemId === 9 ? 'no_margin_right' : ''"
                :id="`${activeSheet.itemId}_${
                  scales[activeSheet.scaleId].scaleRepeater.value
                }`"
                :name="`${activeSheet.itemId}`"
                :value="answers.entries[activeSheet.itemId]"
                @input="validateNrInput($event.target, activeSheet.itemId)"
                min="0"
                max="999"
                :maxlength="currentScaleMeta[1]"
                type="number"
              />
              <span class="minuten" v-if="activeSheet.itemId === 9"
                >Minuten</span
              >
            </div>
            <div
              class="range_slider_wrapper"
              v-if="currentScaleMeta && currentScaleMeta[0] === 'slider'"
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
            <div
              class="radios"
              v-if="
                activeSheet.item &&
                activeSheet.scaleId != 1 &&
                activeSheet.scaleId != 6 &&
                currentScaleMeta[0] != 'slider'
              "
            >
              <fieldset>
                <div
                  :class="`radio ${activeSheet.scaleId} ${input.value}`"
                  v-for="input in scales[activeSheet.scaleId].scaleRepeater"
                  :key="input.value"
                  v-show="
                    activeSheet.scaleId !== 10 ||
                    (activeSheet.scaleId === 10 && input.value !== 11)
                  "
                >
                  <input
                    :id="`${activeSheet.itemId}_${input.value}`"
                    type="radio"
                    :value="input.value"
                    v-model="answers.entries[activeSheet.itemId]"
                    :disabled="disableInput"
                  />

                  <label :for="`${activeSheet.itemId}_${input.value}`">{{
                    input.key
                  }}</label>
                </div>
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
                  ((answers.entries[activeSheet.itemId] === '' ||
                    answers.entries[activeSheet.itemId] === undefined) &&
                    activeSheet.batteryText === undefined &&
                    activeSheet.text === undefined) ||
                  (time > 0.1 && activeSheet.scaleId === 10)
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
                @click="sendInitialAnswers()"
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
    <div class="development devbox" v-if="userStore.showDevbox">
      Development
      <div>
        <div>https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen</div>

        <ion-button @click="getQuestionsInitial"
          >Axios get Questions Initial</ion-button
        >
        <ion-button @click="setAllAnswers()">setAllAnswers()</ion-button>
        <ion-button @click="answers.entries[7] = 6">inputNr.value=6</ion-button>
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
  import { reactive } from 'vue';
  import { ref, onMounted, computed, watch, nextTick, watchEffect } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import axios from 'axios';
  import { IonSpinner } from '@ionic/vue';
  import SpinnerComponent from '@/components/SpinnerComponent.vue';
  import { useRouter, useRoute } from 'vue-router';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

  // let questions = ref(questionsStore.questionsInitial);
  let scales = ref(questionsStore.scalesInitial);
  let batteries = ref(questionsStore.batteriesInitial);
  let questions = ref(questionsStore.questionsInitial);
  let additionalText = ref(questionsStore.additionalTextInitial);

  let answers = reactive({ entries: {}, unchangeable: {} });

  let errors = ref({});

  let showSpinner = ref(false);

  let currentSheet = ref(0);

  // let currentScaleId = ref(0)

  // insert scroll from Base Component
  const baseComp = ref(null);
  function scroll() {
    baseComp.value.scrollTop();
  }

  // End insert scroll from Base Component

  function getRange(start, end) {
    let arr = [];
    for (var i = end; i >= start; i--) arr.push(i);
    console.log('getRange', arr);
    return arr;
  }

  async function validateNrInput(target: any, itemId: any) {
    const value = target.value;
    console.log('target', target);
    console.log('target.maxlength', target.getAttribute('maxlength'));
    console.log('itemId', itemId);

    if (value.length <= target.getAttribute('maxlength')) {
      console.log('value <=', value);
      answers.entries[itemId] = value;
    } else {
      target.value = answers.entries[itemId];
    }
  }

  function disableNumberInput() {
    if (String(answers.entries[7]).length >= 3) {
      console.log('disableNumberInput');
      return true;
    } else return false;
  }

  function nextSheet() {
    if (currentSheet.value <= Object.keys(sheets.value).length) {
      currentSheet.value++;
      scroll();
    }
    if (currentScaleId.value === 10) {
      // Might start the timer even though its already the scaleId 8 as thes gets triggert on nextSheet click
      console.log(
        'QuestionInitialPage - nextSheet - call To Timer',
        time.value
      );
      // // setting timerStopped to true to stop the looping
      // timerStopped.value = true;
      // // setting timerStopped to false to allow the looping
      // // It works here coz
      // timerStopped.value = false;
      if (answers.unchangeable[activeSheet.value.itemId] === undefined) {
        time.value = 5;
        timer();
      }
    }
  }

  function previousSheet() {
    currentSheet.value > 0 && currentSheet.value--;
  }

  onMounted(() => {
    getQuestionsInitial();
  });

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
      if (additionalText.value[question.itemId] != undefined) {
        sheetsArray.push(additionalText.value[question.itemId]);
      }
      // console.log('QuestionInitialPage - question', question);
      let currentBatteryId = question.batteryId;
      if (lastBatteryId != currentBatteryId) {
        if (batteries.value[currentBatteryId].batteryText != '') {
          sheetsArray.push(batteries.value[currentBatteryId]);
        }
      }

      sheetsArray.push(question);
      lastBatteryId = currentBatteryId;
    }

    for (let [key, sheet] of Object.entries(sheetsArray)) {
      // console.log('QuestionInitialPage - key, sheet', key, sheet);

      sheets[key] = sheet;
    }
    // console.log('QuestionInitialPage - sheets', sheets);

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

  // scale

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
    if (currentScaleMeta.value && currentScaleMeta.value[0] === 'slider') {
      console.log('currentScaleMeta ITS Slider');
      answers.entries[activeSheet.value.itemId] = 50;
    }
  });

  // END Scale

  let showTimer = computed(() => {
    let currentScale = currentScaleId.value;
    if (currentScale === 10) {
      return true;
    } else {
      return false;
    }
  });

  function setAnswer(itemId, value) {
    console.log('QuestionInitialPage - setAnswer', itemId, value);
    answers.entries[itemId] = value;
  }

  let missingFields = computed(() => {
    let fields = [];

    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionInitialPage - missingFields', key, question);
      if (answers.entries[key] === undefined || answers.entries[key] === '') {
        fields.push(key);
      }
    }

    return fields;
  });

  function setAllAnswers() {
    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionInitialPage - setAllAnswers', key, question);
      answers.entries[key] = 1;
    }
  }

  function sendInitialAnswers() {
    showSpinner.value = true;

    questionsStore.sendInitialAnswers(answers.entries).then((response) => {
      showSpinner.value = false;

      console.log('QuestionInitialPage - sendInitialAnswers', response);
      userStore.showInitial = false;
      resetAllAnswers();
      router.push('/success');
    });
  }

  function resetAllAnswers() {
    // console.log('QuestionShortPage - setAllAnswers', key, question);
    answers.entries = {};
    answers.unchangeable = {};
    currentSheet.value = 0;
  }

  let time = ref(5.0);

  // let timerStopped = ref(false);

  function timer() {
    console.log('QuestionInitialPage - timer - time', time.value);
    // if (timerStopped.value === true) {
    //   // timerStopped gets set to true with click on weiter or zurück
    //   return;
    // }

    if (time.value >= 0.1) {
      time.value = time.value - 0.1;
      //console.log(timer);
      setTimeout(timer, 100); /* replicate wait 1 second */
    }
  }

  // function stopTimer() {
  //   // gets triggered by click on weiter or zurück
  //   timerStopped.value = true;

  //   console.log('QuestionInitialPage - stopTimer');
  // }

  let disableInput = computed(() => {
    if (
      (currentScaleId.value === 10 && time.value <= 0.1) ||
      answers.unchangeable[activeSheet.value.itemId] == true
    ) {
      setUnchangeableValue();
      if (answers.entries[activeSheet.value.itemId] == undefined) {
        // There was no Input at Timeout
        setTimeoutValue();
      }
      return true;
    } else return false;
  });

  function setTimeoutValue() {
    // There was no Input at Timeout, Value gets set to 11
    console.log('QuestionInitialPage -setTimeoutValue');
    answers.entries[activeSheet.value.itemId] = 11;
  }

  function setUnchangeableValue() {
    // ones the value got set, it cant be changed again
    answers.unchangeable[activeSheet.value.itemId] = true;
  }

  let disablePreviousButton = computed(() => {
    if (time.value > 0.1 && activeSheet.value.scaleId === 10) {
      return true;
    } else {
      return false;
    }
  });
</script>

<!-- <style scoped>
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

  .radio,
  .number {
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
    width: 300px;

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
    margin-top: 20px;
    font-weight: 500;
  }

  fieldset {
    border: none;
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
</style> -->
