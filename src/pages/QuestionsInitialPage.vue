<template>
  <base-layout ref="baseComp" :fullscreen="true">
    <div class="wrapper_h100">
      <div class="sheets">
        <li
          class="sheet"
          v-if="activeSheet != undefined && currentSheet != sheets.length"
        >
          <div class="progress">
            {{ Math.round((activeSheet.sheetId / sheets.length) * 100) }} %
          </div>
          <p class="item_text">
            <span
              style="white-space: pre-line"
              v-html="activeSheet.item"
            ></span>
          </p>
          <!-- 5secTimer -->
          <div
            class="timer"
            v-if="
              time != undefined &&
              activeSheet != undefined &&
              activeSheet.item != undefined &&
              activeSheet.itemId != undefined &&
              activeSheet.scale != undefined &&
              activeSheet.scale.options != undefined &&
              activeSheet.scale.options.showTimer === true &&
              activeSheet.options != undefined &&
              activeSheet.options.inputDisabled != true
            "
          >
            Timer: {{ time.toFixed(1) }}
          </div>
          <!-- End 5sec Timer -->
          <!-- 3sec Timer  -->
          <div
            class="timer3"
            v-if="
              activeSheet != undefined &&
              activeSheet.itemId != undefined &&
              activeSheet.options.timer === 3 &&
              showTimer3 === true
            "
          >
            <div class="timer" v-if="showTimer3">
              <span v-if="time3 >= 0.1">{{ time3.toFixed(1) }} </span>
              <span v-if="time3 < 0.1"> 0.0 </span>
            </div>
          </div>
          <!-- END 3sec Timer  -->
          <!-- number with dropdown -->
          <div
            class="number"
            v-if="
              activeSheet.itemId != '' &&
              activeSheet.scale.options.fieldType === 'number' &&
              activeSheet.scale.options.dropdown === true
            "
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
              <option
                v-for="n in getRange(
                  scales[activeSheet.scaleId].options.min,
                  scales[activeSheet.scaleId].options.max
                )"
                :key="n"
              >
                {{ n }}
              </option>
            </select>
          </div>
          <!-- END Number with Dropdwon -->
          <!-- Normal radios -->
          <div
            class="radios"
            v-if="
              activeSheet != undefined &&
              activeSheet.scaleId != undefined &&
              activeSheet.scaleId != '' &&
              activeSheet.scale.options != undefined &&
              activeSheet.scale.options.fieldType != undefined &&
              activeSheet.scale.options.fieldType === 'radio'
            "
          >
            <fieldset class="radio_fieldset">
              <div
                :class="`radio ${activeSheet.scaleId} ${input.value}`"
                v-for="(input, key) in scales[activeSheet.scaleId]
                  .scaleRepeater"
                :key="key"
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
          <!--END normal radios -->
          <!-- Multiple radios -->
          <div
            class="radios"
            v-if="
              activeSheet != undefined &&
              activeSheet.scaleId != undefined &&
              activeSheet.scaleId != '' &&
              activeSheet.scale.options.fieldType === 'multi'
            "
          >
            <fieldset>
              <div
                :class="`radio ${activeSheet.scaleId} ${input.value}`"
                v-for="input in scales[activeSheet.scaleId].scaleRepeater"
                :key="input.key"
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

          <!-- Number input no Dropdown -->
          <div
            class="number"
            v-if="
              activeSheet != undefined &&
              activeSheet.itemId != undefined &&
              activeSheet.itemId != '' &&
              activeSheet.scale.options.fieldType === 'number' &&
              activeSheet.scale.options.dropdown === false
            "
          >
            <input
              :id="`${activeSheet.itemId}_${
                scales[activeSheet.scaleId].scaleRepeater.value
              }`"
              :name="`${activeSheet.itemId}`"
              :value="answers.entries[activeSheet.itemId]"
              @input="validateNrInput($event.target, activeSheet.itemId)"
              min="0"
              max="999"
              :maxlength="activeSheet.scale.options.fieldDigits"
              type="number"
            />
            <span class="minuten" v-if="activeSheet.itemId === 9">Minuten</span>
          </div>
          <!-- END Number input -->
          <!-- Range Slider -->
          <div
            class="range_slider_wrapper"
            v-if="
              activeSheet.scale != undefined &&
              activeSheet.scale.options != undefined &&
              activeSheet.scale.options.fieldType === 'slider'
            "
          >
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
              :min="activeSheet.scale.options.min"
              :max="activeSheet.scale.options.max"
              step="1"
              :name="`${activeSheet.itemId}`"
              v-model="answers.entries[activeSheet.itemId]"
            />
          </div>
          <!-- END Range Slider -->

          <div class="buttons">
            <ion-button
              @click="nextSheet()"
              color="primary"
              :disabled="false"
              v-if="
                activeSheet.options.startTimer3 != true ||
                (activeSheet.options.startTimer3 === true && time3 <= 0.1)
              "
            >
              weiter
            </ion-button>

            <div
              class="timer3"
              v-if="
                activeSheet != undefined &&
                activeSheet.itemId != undefined &&
                activeSheet.options.startTimer3 === true
              "
            >
              <div class="buttons">
                <ion-button v-if="showTimer3 == false" @click="timer3()"
                  >Ja</ion-button
                >
              </div>
            </div>

            <ion-button
              @click="previousSheet()"
              color="tertiary"
              :disabled="false"
            >
              zurück
            </ion-button>
          </div>
        </li>
        <!-- Absenden Seite -->
        <li class="sheet" v-if="currentSheet == sheets.length">
          <div class="absenden_text">Bereit zum Absenden?</div>

          <div class="buttons">
            <ion-button
              color="primary"
              @click="sendInitialAnswers()"
              :disabled="
                numberOfItems != Object.keys(answers.entries).length ||
                questionsStore.initialAnswerExist === true
              "
              >Fragebogen absenden</ion-button
            ><ion-button @click="previousSheet()" color="tertiary"
              >zurück</ion-button
            >
          </div>
        </li>
      </div>
    </div>
    <div class="development devbox" v-if="userStore.showDevbox">
      <div>
        <div
          v-if="activeSheet != undefined && activeSheet.batteryId != undefined"
        >
          <div>number Of Total sheets: {{ sheets.length }}</div>
          <div>number Of Total Items: {{ numberOfItems }}</div>
          <br />
          <div>activeSheet.sheetId :{{ activeSheet.sheetId }}</div>

          <div class="">activeSheet.itemId: {{ activeSheet.itemId }}</div>
          <div class="">activeSheet.orderId: {{ activeSheet.orderId }}</div>
          <br />
          <div class="">activeSheet.batteryId: {{ activeSheet.batteryId }}</div>
          <!-- <div
            class=""
            v-if="
              activeSheet.batteryId != '' &&
              batteries[activeSheet.batteryId].batteryName != undefined
            "
          >
            batteryName: {{ batteries[activeSheet.batteryId].batteryName }}
          </div> -->
          <!-- <div
            class=""
            v-if="batteries[activeSheet.batteryId].batteryMeta != undefined"
          >
            batteryMeta: {{ batteries[activeSheet.batteryId].batteryMeta }}
          </div> -->
          attentionTestSheetNr: {{ attentionTestSheetNr }}
          <div>currentSheet: {{ currentSheet }}</div>
        </div>

        <ion-button @click="getQuestionsInitial"
          >Axios get Questions Initial</ion-button
        >
        <ion-button @click="setAllAnswers()">setAllAnswers()</ion-button>
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
  import { Storage } from '@ionic/storage';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

  let answers = reactive({ entries: { 6: [] }, unchangeable: {} });

  let errors = ref({});

  let showSpinner = ref(false);

  let currentSheet = ref(0);

  function getQuestionsInitial() {
    questionsStore.getInitialQuestions();
  }
  getQuestionsInitial();

  let activeSheet = computed(() => {
    if (currentSheet.value < sheets.value.length) {
      // change the active sheet according to currentSheet
      console.log('NOT LAST ENTRY', currentSheet.value);
      return sheets.value[currentSheet.value];
    } else {
      // but if current sheet is heigher than sheets.length, than return last sheet. Necessary to not run into an non existing sheet when counting currentSheet. Current sheet gets countet to a heiger value than sheets.length for displaying the 'Bereit zum Absenden' page.
      console.log('LAST ENTRY', currentSheet.value);
      return sheets.value[sheets.value.length];
    }
  });

  // let currentScaleId = ref(0)

  // insert scroll from Base Component
  const baseComp = ref(null);
  function scroll() {
    baseComp.value.scrollTop();
  }

  let sheetsNoRandom = computed(() => {
    let sheetsArray = [];
    let allSheets = questionsStore.sheetsInitial;

    for (const [key, sheet] of Object.entries(allSheets)) {
      let newSheet = sheet;

      // Adding the options string as an Object
      if (
        sheet != undefined &&
        sheet.options != undefined &&
        sheet.options != ''
      ) {
        console.log('options - sheet.options', sheet.options);
        newSheet['options'] = JSON.parse(sheet.options);
      }

      // Adding scales to each sheet
      if (sheet.scaleId != undefined && sheet.scaleId != '') {
        sheet['scale'] = scales.value[sheet.scaleId];
      }

      sheetsArray.push(newSheet);
    }
    return sheetsArray;
  });

  let sheets = computed(() => {
    console.log('QInitial - sheets 1');
    let sheetsArray = [];
    let allSheets = sheetsNoRandom.value;

    let lastBatteryId = 0;

    // temporary object for storing sheets of an battery which will be randomized
    let batteryArray = [];

    let allSheetLength = Object.keys(allSheets).length;
    let i = 1;

    for (const [key, sheet] of Object.entries(allSheets)) {
      console.log('QInitial - sheets 2 - key:', key, sheet);
      let battery = batteries.value[sheet.batteryId];

      if (lastBatteryId != sheet.batteryId) {
        // a new Battery starts
        if (Object.keys(batteryArray).length != 0) {
          // putting entries from batteryArray to sheetsArray
          if (
            batteries.value[lastBatteryId] != undefined &&
            batteries.value[lastBatteryId].options != undefined &&
            batteries.value[lastBatteryId].options.randomizeItems !=
              undefined &&
            batteries.value[lastBatteryId].options.randomizeItems === true
          ) {
            // randomization
            batteryArray = shuffle(batteryArray);
          }

          for (battery of batteryArray) {
            sheetsArray.push(battery);
          }
          batteryArray = [];
        }
      }

      batteryArray.push(sheet);

      if (i == allSheetLength) {
        // its the last sheet
        for (battery of batteryArray) {
          sheetsArray.push(battery);
        }
      }

      lastBatteryId = sheet.batteryId;
      i++;
    }
    // randomInt for putting the random page somewhere
    let randomInt = getRandomInt(sheetsArray.length - 1);
    let attentionPageIndex;
    console.log('randomInt:', randomInt);

    let j = 1;
    for (const [index, sheet] of Object.entries(sheetsArray)) {
      // Adding a sheetId to every sheet
      sheet['sheetId'] = Number(index) + 1;
      if (sheet.itemId != '') {
        // Adding a itemOrderNr only to questions/items
        sheet['orderId'] = j;
        j++;
      }

      // getting the random pageIndex
      if (sheet.options != undefined && sheet.options.attentionCheck === true) {
        console.log('attentionPageOriginalIndex:', index);
        attentionPageIndex = index;
      }
      //END getting the random pageIndex
    }

    // putting the random page somewhere

    // splice(start,deleteCount, item1, item2 ...)

    sheetsArray.splice(randomInt, 0, sheetsArray[attentionPageIndex]);
    sheetsArray.splice(Number(attentionPageIndex) + 1, 1);

    // End putting the random page somewhere

    return sheetsArray;
  });

  watch(activeSheet, (newValue) => {
    if (
      newValue != undefined &&
      newValue.options != undefined &&
      newValue.options.defaultValue != undefined &&
      answers.entries[newValue.itemId] === undefined
    ) {
      // sets a default value if the item has the option defaultValue, for example a slider to 50
      answers.entries[newValue.itemId] = newValue.options.defaultValue;
    }
  });

  let numberOfItems = computed(() => {
    // calculates the nr of Items = questions
    let counter = 0;

    for (const [index, sheet] of Object.entries(sheets.value)) {
      if (sheet != undefined && sheet.itemId != '') {
        counter++;
        console.log('numberOfItems - sheet', sheet);
      }
    }
    return counter;
  });

  let batteries = computed(() => {
    let batteriesObject = {};
    let allBatteries = questionsStore.batteriesInitial;

    for (const [index, battery] of Object.entries(allBatteries)) {
      let newBattery = battery;

      // Adding the options string as an Object
      if (
        battery != undefined &&
        battery.options != undefined &&
        battery.options != ''
      ) {
        console.log('options - battery.options', battery.options);
        newBattery['options'] = JSON.parse(battery.options);
        console.log('options - battery.options - done', battery.options);
      }

      batteriesObject[newBattery.batteryId] = newBattery;
    }
    return batteriesObject;
  });

  let scales = computed(() => {
    let scalesObject = {};
    let allScales = questionsStore.scalesInitial;

    for (const [key, scale] of Object.entries(allScales)) {
      let newSheet = scale;
      console.log('options - scale', scale);

      // Adding the options string as an Object
      if (
        scale != undefined &&
        scale.options != undefined &&
        scale.options != ''
      ) {
        console.log('options - scale.options', scale.options);
        newSheet['options'] = JSON.parse(scale.options);
      }

      scalesObject[key] = newSheet;
    }
    return scalesObject;
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

  function previousSheet() {
    currentSheet.value > 0 && currentSheet.value--;
  }

  function nextSheet() {
    if (currentSheet.value <= sheets.value.length) {
      currentSheet.value++;
      console.log('nextSheet', currentSheet.value);
      scroll();
    }
    if (
      activeSheet.value != undefined &&
      activeSheet.value.scale != undefined &&
      activeSheet.value.scale.options != undefined &&
      activeSheet.value.scale.options.showTimer === true &&
      activeSheet.value.options.inputDisabled != true &&
      answers.unchangeable[activeSheet.value.itemId] === undefined
      // last condidion makes sure that the example sheet before the timer questions does not start the timer
    ) {
      time.value = 5;
      timer();
    }
  }

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

  function setAllAnswers() {
    for (let [key, question] of Object.entries(sheets.value)) {
      console.log('QuestionInitialPage - setAllAnswers', key, question);

      if (question.itemId != '') {
        if (question.itemId == 6) {
          answers.entries[question.itemId] = [1];
        } else {
          answers.entries[question.itemId] = 1;
        }
      }
    }
  }

  let time = ref(5.0);
  let time3 = ref(3.0);
  let showTimer3 = ref(false);

  let disableInput = computed(() => {
    if (
      activeSheet.value.options != '' &&
      activeSheet.value.options.inputDisabled === true
    ) {
      // this is the case for the sheet with the example radios before the timer questions, coz here its only to show the possible answers to the user
      return true;
    }
    if (
      (activeSheet.value != undefined &&
        activeSheet.value.scale != undefined &&
        activeSheet.value.scale.options != undefined &&
        activeSheet.value.scale.options.showTimer === true &&
        time.value <= 0.1) ||
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
    } else {
      nextSheet();
    }
  }

  function timer3() {
    if (time3.value === 3) {
      nextSheet();
    }

    showTimer3.value = true;
    console.log('QuestionInitialPage - timer - time', time3.value);

    if (time3.value >= 0.1) {
      time3.value = time3.value - 0.1;
      //console.log(timer);
      setTimeout(timer3, 100); /* replicate wait 1 second */
    } else {
      nextSheet();
    }
  }

  function setTimeoutValue() {
    // There was no Input at Timeout, Value gets set to 11
    console.log('QuestionInitialPage -setTimeoutValue');
    if (
      activeSheet.value != undefined &&
      activeSheet.value.itemId != undefined
    ) {
      answers.entries[activeSheet.value.itemId] = 11;
    }
  }

  function setUnchangeableValue() {
    // ones the value got set, it cant be changed again
    if (
      activeSheet.value != undefined &&
      activeSheet.value.itemId != undefined
    ) {
      answers.unchangeable[activeSheet.value.itemId] = true;
    }
  }

  function sendInitialAnswers() {
    showSpinner.value = true;

    questionsStore.sendInitialAnswers(answers.entries).then((response) => {
      showSpinner.value = false;

      console.log('QuestionInitialPage - sendInitialAnswers', response);
      resetAllAnswers();
      router.replace('/success');
    });
  }

  function resetAllAnswers() {
    // console.log('QuestionShortPage - setAllAnswers', key, question);
    answers.entries = { 6: [] };
    answers.unchangeable = {};
    currentSheet.value = 0;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
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

<style scoped>
  .buttons {
    position: sticky !important;
  }
</style>
