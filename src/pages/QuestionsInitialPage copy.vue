<template>
  <base-layout>
    <div class="wrapper_h100">
      <div class="sheets">
        <TransitionGroup name="list">
          <li class="sheet" v-for="(sheet, key) in activeSheet" :key="key">
            <div class="progress" v-if="sheet.itemId">
              {{ sheet.itemId }}/{{ Object.keys(questions).length }}
            </div>
            <div class="development">
              sheet key: {{ key }}, sheet.itemId: {{ sheet.itemId }}
            </div>
            <p class="item_text" v-if="sheet.item">
              <span v-html="sheet.itemId"></span>.
              <span v-html="sheet.item"></span>
            </p>

            <p
              class="battery_text"
              v-if="sheet.batteryText"
              v-html="sheet.batteryText"
            ></p>
            <div class="number" v-if="sheet.item && sheet.scaleId === 1">
              <input
                class=""
                :id="`${sheet.itemId}_${
                  scales[sheet.scaleId].scaleRepeater.value
                }`"
                type="number"
                :name="`${sheet.itemId}`"
                v-model="answers[1]"
              />
            </div>
            <div class="radios" v-if="sheet.item && sheet.scaleId != 1">
              <fieldset>
                <div
                  :class="`radio ${sheet.scaleId} ${input.value}`"
                  v-for="input in scales[sheet.scaleId].scaleRepeater"
                  :key="input.value"
                  v-show="
                    sheet.scaleId !== 7 ||
                    (sheet.scaleId === 7 && input.value !== 11)
                  "
                >
                  <input
                    :id="`${sheet.itemId}_${input.value}`"
                    type="radio"
                    :name="`${sheet.itemId}`"
                    @input="setAnswer(sheet.itemId, input.value)"
                  />
                  <label :for="`${sheet.itemId}_${input.value}`">{{
                    input.key
                  }}</label>
                </div>
              </fieldset>
            </div>
            <div class="buttons">
              <ion-button
                @click="nextSheet()"
                color="primary"
                :disabled="
                  (answers[sheet.itemId] === '' ||
                    answers[sheet.itemId] === undefined) &&
                  sheet.batteryText === undefined
                "
                >weiter</ion-button
              ><ion-button
                @click="previousSheet()"
                v-if="sheet.itemId != 1"
                color="tertiary"
                >zurück</ion-button
              >
            </div>
          </li>
          <li class="sheet" v-if="currentSheet == Object.keys(sheets).length">
            <div class="absenden_text">Bereit zum Absenden?</div>
            <div
              class="missing_text"
              v-if="Object.keys(missingFields).length != 0 || answers[1] === ''"
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
                    Object.keys(answers).length ||
                  answers[1] === '' ||
                  Object.keys(answers).length === 0
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
      </div>
      <div>answers: {{ answers }}</div>
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
  import { ref, onMounted, computed } from 'vue';
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

  let answers = ref({});

  let errors = ref({});

  let showSpinner = ref(false);

  let currentSheet = ref(0);

  function nextSheet() {
    if (currentSheet.value <= Object.keys(sheets.value).length) {
      currentSheet.value++;
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
      // console.log('QuestionInitialPage - question', question);
      let currentBatteryId = question.batteryId;
      if (lastBatteryId != currentBatteryId) {
        sheetsArray.push(batteries.value[currentBatteryId]);
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
        activeSheet[key] = sheet;
      }
    }

    return activeSheet;
  });

  function setAnswer(itemId, value) {
    // console.log('QuestionInitialPage - setAnswer', itemId, value);
    answers.value[itemId] = value;
  }

  let missingFields = computed(() => {
    let fields = [];

    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionInitialPage - missingFields', key, question);
      if (answers.value[key] === undefined || answers.value[key] === '') {
        fields.push(key);
      }
    }

    return fields;
  });

  function setAllAnswers() {
    for (let [key, question] of Object.entries(questions.value)) {
      // console.log('QuestionInitialPage - setAllAnswers', key, question);
      answers.value[key] = 1;
    }
  }

  function sendInitialAnswers() {
    showSpinner.value = true;

    questionsStore.sendInitialAnswers(answers).then((response) => {
      showSpinner.value = false;

      console.log('QuestionInitialPage - sendInitialAnswers', response);
      userStore.showInitial = false;
      router.push('/success');
    });
  }
</script>

<style scoped>
  .wrapper_h100 {
    height: 100%;
  }

  .sheets {
    height: 100%;
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
    height: 100%;
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

  .display_none {
    display: none;
  }
</style>
