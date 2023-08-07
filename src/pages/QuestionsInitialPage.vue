<template>
  <base-layout ref="baseComp" :fullscreen="true">
    <div class="wrapper_h100">
      <div class="sheets">
        <li
          class="sheet"
          v-if="activeSheet != undefined && currentSheet != sheets.length"
        >
          <div
            class="progress"
            v-if="
              activeSheet.itemId === '' ||
              (activeSheet.scale != undefined &&
                activeSheet.scale.options != undefined &&
                activeSheet.scale.options.showTimer != true)
            "
          >
            {{ Math.round((activeSheet.sheetId / sheets.length) * 100) }} %
          </div>
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
            {{ time.toFixed(1) }} Sekunden
            <div class="progress_bar">
              <div
                class="progress_bar_inner"
                :style="{
                  width:
                    (time / activeSheet.scale.options.timerSec) * 100 + '%',
                }"
              ></div>
            </div>
          </div>

          <!-- End 5sec Timer -->
          <!-- 3sec Timer  -->
          <div
            class="timer3"
            v-if="
              activeSheet != undefined &&
              activeSheet.itemId != undefined &&
              activeSheet.options != undefined &&
              activeSheet.options.timer === 3 &&
              showTimer3 === true
            "
          >
            <div class="timer" v-if="showTimer3">
              <span v-if="time3 >= 0.1">{{ time3.toFixed(1) }} </span>
              <span v-if="time3 < 0.1"> 0.0 </span>
              <div class="progress_bar">
                <div
                  class="progress_bar_inner"
                  :style="{ width: 33 * time3 + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <!-- END 3sec Timer  -->
          <div class="item_text">
            <span
              style="white-space: pre-line"
              v-html="activeSheet.item"
            ></span>
          </div>

          <!-- START Scale as Text  (for randomized scale) -->

          <div
            v-if="
              activeSheetOptions &&
              activeSheet.options.randomizedUserbased === true
            "
            class="item_text_scale"
          >
            <!-- <span
              style="white-space: pre-line"
              v-html="activeSheet.item"
            ></span> -->

            <!-- Normal radios -->
            <div class="radios">
              <fieldset class="radio_fieldset">
                <div
                  v-for="input in scales[activeSheet.options.showScale]
                    .scaleRepeater"
                  :key="`${activeSheet.itemId}_${input.value}`"
                  :style="inlineStyle(input.value)"
                >
                  <!-- <input
                    :id="`${activeSheet.itemId}_${input.value}`"
                    type="radio"
                    :value="Number(input.value)"
                    v-model="answers.entries[activeSheet.itemId]"
                    :disabled="disableInput"
                  /> -->

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
          </div>

          <!-- END Scale as Text  (for randomized scale) -->

          <!-- number with dropdown -->
          <div
            class="number"
            v-if="
              activeSheet.itemId != '' &&
              activeSheetScaleOptions &&
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
              v-model="answers.entries[activeSheet.itemId]"
              @click="
                changeInputToNr(
                  $event.target,
                  activeSheet.itemId,
                  $event,
                  'noZero'
                )
              "
            >
              a
              <option class="height_zero"></option>
              <option
                v-for="n in getRange(
                  scales[activeSheet.scaleId].options.min,
                  scales[activeSheet.scaleId].options.max
                )"
                :key="`${activeSheet.itemId}_${Number(n)}`"
              >
                {{ Number(n) }}
              </option>
            </select>
          </div>
          <!-- END Number with Dropdwon -->
          <!-- Normal radios -->
          <div
            class="radios"
            :class="
              activeSheetScaleOptions &&
              activeSheet.scale.options.showTimer === true
                ? 'margin-top'
                : ''
            "
            v-if="
              activeSheet != undefined &&
              activeSheet.scaleId != undefined &&
              activeSheet.scaleId != '' &&
              activeSheet.scale != undefined &&
              activeSheet.scale.options != undefined &&
              activeSheet.scale.options.fieldType != undefined &&
              activeSheet.scale.options.fieldType === 'radio'
            "
          >
            <fieldset class="radio_fieldset">
              <div
                :class="`radio ${activeSheet.scaleId} ${input.value}`"
                v-for="input in scales[activeSheet.scaleId].scaleRepeater"
                :key="`${activeSheet.itemId}_${input.value}`"
                :style="inlineStyle(input.value)"
              >
                <input
                  :id="`${activeSheet.itemId}_${input.value}`"
                  type="radio"
                  :value="Number(input.value)"
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
          <!-- radios with Freifeld -->
          <div
            class="radios"
            :class="
              activeSheetScaleOptions &&
              activeSheet.scale.options.showTimer === true
                ? 'margin-top'
                : ''
            "
            v-if="
              activeSheet != undefined &&
              activeSheet.scaleId != undefined &&
              activeSheet.scaleId != '' &&
              activeSheetScaleOptions &&
              activeSheet.scale.options.fieldType != undefined &&
              activeSheet.scale.options.fieldType === 'radioAndFree'
            "
          >
            <input
              :id="`${activeSheet.itemId}_freifeld`"
              class="freeFieldToAnswers"
              type="text"
              @input.prevent="
                freeFieldToAnswers($event.target, activeSheet.itemId, $event)
              "
              :disabled="disableInput"
              v-model="freeFieldToAnswersText[activeSheet.itemId]"
              :placeholder="activeSheet.options.placeholder"
            />
            <fieldset
              class="radio_fieldset"
              :class="{
                invisible:
                  answers.entries[activeSheet.itemId] != undefined &&
                  (answers.entries[activeSheet.itemId].length === 0 ||
                    answers.entries[activeSheet.itemId][1] === ''),
              }"
            >
              <div
                :class="`radio ${activeSheet.scaleId} ${input.value}`"
                v-for="input in scales[activeSheet.scaleId].scaleRepeater"
                :key="`${activeSheet.itemId}_${input.value}`"
              >
                <input
                  :id="`${activeSheet.itemId}_${input.value}`"
                  type="radio"
                  :value="Number(input.value)"
                  v-model="answers.entries[activeSheet.itemId][0]"
                  :disabled="disableInput"
                />

                <label :for="`${activeSheet.itemId}_${input.value}`">{{
                  input.key
                }}</label>
              </div>
            </fieldset>
          </div>
          <!--END radios with Freifeld -->
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
                :key="`${activeSheet.itemId}_${input.value}`"
              >
                <input
                  :id="input.key"
                  type="checkbox"
                  :value="Number(input.value)"
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
              @input="
                validateNrInput($event.target, activeSheet.itemId, $event)
              "
              min="0"
              max="999"
              :maxlength="activeSheet.scale.options.fieldDigits"
              type="number"
              :class="
                activeSheet.options.scaleText != undefined
                  ? 'no_margin_right'
                  : ''
              "
            />
            <span
              class="scaleText"
              v-if="activeSheet.options.scaleText != undefined"
              >{{ activeSheet.options.scaleText }}</span
            >
          </div>
          <!-- END Number input -->
          <!-- Text input -->
          <!-- <div
            class="text"
            v-if="
              activeSheet != undefined &&
              activeSheet.itemId != undefined &&
              activeSheet.itemId != '' &&
              activeSheet.scale.options.fieldType === 'text'
            "
          >
            <span
              class="scaleText"
              v-if="activeSheet.options.scaleText != undefined"
              >{{ activeSheet.options.scaleText }}</span
            >
          </div> -->
          <!-- END Text input -->
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
              :step="
                activeSheet.scale.options.step
                  ? activeSheet.scale.options.step
                  : 1
              "
              :name="`${activeSheet.itemId}`"
              v-model="answers.entries[activeSheet.itemId]"
              @input="
                changeInputToNr(
                  $event.target,
                  activeSheet.itemId,
                  $event,
                  'zeroOK'
                )
              "
            />
          </div>
          <!-- END Range Slider -->

          <div class="buttons_wrapper">
            <div
              class="buttons"
              :class="
                activeSheetScaleOptions &&
                activeSheet.scale.options.showTimer === true
                  ? 'margin-top-zero'
                  : ''
              "
            >
              <ion-button
                class="next"
                @click="nextSheet()"
                color="primary"
                :disabled="
                  (activeSheet.itemId != '' &&
                    answers.entries[activeSheet.itemId] === undefined) ||
                  (activeSheet.itemId != '' &&
                    activeSheet.scale.options != undefined &&
                    activeSheet.scale.options.fieldType === 'multi' &&
                    answers.entries[activeSheet.itemId].length === 0 &&
                    activeSheet.scale.options.acceptEmpty === false) ||
                  (activeSheet.itemId != '' &&
                    activeSheet.scale.options != undefined &&
                    activeSheet.scale.options.fieldType === 'radioAndFree' &&
                    answers.entries[activeSheet.itemId].length != 0 &&
                    answers.entries[activeSheet.itemId][0] == null)
                  // ||
                  // (activeSheet.itemId != '' &&
                  //   activeSheet.scale.options != undefined &&
                  //   activeSheet.scale.options.fieldType === 'radioAndFree' &&
                  //   answers.entries[activeSheet.itemId].length === 0)
                "
                v-if="
                  (time == 0 && time3 == 0) ||
                  (timerRuns === false &&
                    time3 === 3 &&
                    activeSheetOptions &&
                    activeSheet.options.startTimer3 != true)
                "
              >
                weiter
              </ion-button>

              <div
                v-if="
                  activeSheet != undefined &&
                  activeSheet.itemId != undefined &&
                  activeSheetOptions &&
                  activeSheet.options.startTimer3 === true
                "
              >
                <ion-button
                  class="next yes"
                  v-if="showTimer3 == false"
                  @click="nextSheet()"
                  >Ja</ion-button
                >
              </div>

              <ion-button
                class="previous"
                @click="previousSheet()"
                color="tertiary"
                :disabled="false"
                v-if="
                  (activeSheet.sheetId != 1 && time == 0 && time3 == 0) ||
                  (activeSheet.sheetId != 1 &&
                    timerRuns === false &&
                    time3 === 3)
                "
              >
                zurück
              </ion-button>
            </div>
          </div>
        </li>
        <!-- Absenden Seite -->
        <li
          class="sheet"
          v-if="
            currentSheet == sheets.length &&
            Object.keys(answers.entries).length > 5
          "
        >
          <div class="progress"></div>
          <div class="absenden_text">
            <div class="item_text"><p>Bereit zum Absenden?</p></div>
          </div>
          <div class="buttons_wrapper">
            <div class="buttons">
              <ion-button color="primary" @click="sendInitialAnswers()"
                >Fragebogen absenden</ion-button
              ><ion-button @click="previousSheet()" color="tertiary"
                >zurück</ion-button
              ><ion-button
                color="tertiary"
                @click="backHome()"
                v-if="showBackHomeButton"
                >Startseite</ion-button
              >
            </div>
          </div>
        </li>
      </div>
    </div>
    <!-- START Devbox -->
    <div
      v-if="
        userStore.userData.username === 'nviiadmin' ||
        userStore.userData.username === 'RolandToth'
      "
    >
      <div class="admin_buttons">
        <div
          class="admin"
          v-if="userStore.userData.username === 'nviiadmin'"
          @click="userStore.showInfoboxInitial = !userStore.showInfoboxInitial"
        >
          <ion-button color="medium">info</ion-button>
        </div>

        <div class="admin" @click="setAllAnswers">
          <ion-button color="medium">setAll</ion-button>
        </div>
      </div>
      <div class="development devbox" v-if="userStore.showInfoboxInitial">
        <div>
          <div
            v-if="
              activeSheet != undefined && activeSheet.batteryId != undefined
            "
          >
            <div>number Of Total sheets: {{ sheets.length }}</div>
            <div>number Of Total Items: {{ numberOfItems }}</div>
            <br />
            <div>activeSheet.sheetId :{{ activeSheet.sheetId }}</div>

            <div class="">activeSheet.itemId: {{ activeSheet.itemId }}</div>
            <div class="">activeSheet.orderId: {{ activeSheet.orderId }}</div>
            <br />
            <div class="">
              activeSheet.batteryId: {{ activeSheet.batteryId }}
            </div>
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
            <div>
              Object.keys(answers.entries).length:
              {{ Object.keys(answers.entries).length }}
            </div>
            <div>currentSheet: {{ currentSheet }}</div>
            <div v-if="answers.entries[activeSheet.itemId] != undefined">
              answers.entries[activeSheet.itemId].length :
              {{ answers.entries[activeSheet.itemId].length }}
            </div>
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
        <input
          placeholder="currentSheet"
          type="number"
          v-model="currentSheet"
        />
      </div>
    </div>
    <!-- END Devbox -->
    <spinner-component v-if="showSpinner"
      >Daten werden gesendet.</spinner-component
    >
    <spinner-component v-if="showSpinnerLoading"
      >Fragebogen wird geladen.</spinner-component
    >
    <permission-component
      v-if="showPermissionModal === true"
      :closeModal="closePermissionModal"
    ></permission-component>

    <notification-permission-component
      v-if="showNotificationPermissionModal === true"
      :closeNotificationPermissionModal="closeNotificationPermissionModal"
    ></notification-permission-component>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted, computed, watch, nextTick, watchEffect } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import { useStatsStore } from '@/stores/statsStore';
  import axios from 'axios';
  import { IonSpinner } from '@ionic/vue';
  import SpinnerComponent from '@/components/SpinnerComponent.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Storage } from '@ionic/storage';
  import PermissionComponent from '@/components/PermissionComponent.vue';
  import NotificationPermissionComponent from '@/components/NotificationPermissionComponent.vue';
  import { Capacitor } from '@capacitor/core';
  import { LocalNotifications } from '@capacitor/local-notifications';
  import dayjs from 'dayjs';

  let platform;

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const statsStore = useStatsStore();
  const router = useRouter();
  let showPermissionModal = ref(false);
  let showNotificationPermissionModal = ref(false);

  onMounted(async () => {
    platform = Capacitor.getPlatform();
    console.log('QuestionsInitial Platform: ', platform);

    questionsStore.timestampQuestionsInitialStarted = dayjs().valueOf();

    if (platform === 'web' || platform === 'android') {
      var result = await statsStore.checkAndroidPermissions();
      console.log('QuestionsInitial - result', result);

      if (
        result.permission != undefined &&
        result.permission === 'NoPermission'
      ) {
        console.log(
          'QuestionsInitial - permission - NoPermission',
          result.permission
        );
        showPermissionModal.value = true;
      }
    }

    // START check notification permission

    await LocalNotifications.checkPermissions().then(function (result) {
      console.log(
        'QuestionsInitial - checkNotificationPermissions - result',
        result
      );

      if (
        result.display != undefined &&
        result.display != 'granted' &&
        platform != 'ios'
      ) {
        showNotificationPermissionModal.value = true;
      }
    });

    // END check notification permission
  });

  // let computedStyle = computed(() => {
  //   if (
  //     activeSheet.value != undefined &&
  //     activeSheet.value.scaleId != undefined &&
  //     activeSheet.value.scaleId != '' &&
  //     activeSheet.value.scale != undefined &&
  //     activeSheet.value.scale.options != undefined &&
  //     activeSheet.value.scale.options.randomizedUserbased === true
  //   ) {
  //     let order = userStore.randomArray[]
  //     let style = { order: 1 };
  //     return style;
  //   }

  //   return {};
  // });

  function inlineStyle(value) {
    if (
      (activeSheet.value != undefined &&
        activeSheet.value.scaleId != undefined &&
        activeSheet.value.scaleId != '' &&
        activeSheet.value.scale != undefined &&
        activeSheet.value.scale.options != undefined &&
        activeSheet.value.scale.options.randomizedUserbased === true) ||
      (activeSheetOptions &&
        activeSheet.value.options.randomizedUserbased === true)
    ) {
      let order = userStore.randomArray[value];
      let style = { order: order };
      return style;
    } else {
      return {};
    }
  }

  function closePermissionModal() {
    showPermissionModal.value = false;
  }

  function closeNotificationPermissionModal() {
    showNotificationPermissionModal.value = false;
  }

  // let answers = reactive({ entries: { 6: [], 53: [] }, unchangeable: {} });
  let answers = reactive({ entries: {}, unchangeable: {} });

  let errors = ref({});

  let showSpinner = ref(false);
  let showSpinnerLoading = ref(false);

  let currentSheet = ref(0);

  async function getQuestionsInitial() {
    showSpinnerLoading.value = true;

    let request = await questionsStore.getInitialQuestions();
    console.log('getIQ - result: ', request);
    if (request.status != 200 && request.status != 201) {
      userStore.appMessage =
        'Es gab einen Fehler: ' +
        request.code +
        '<br>Message: ' +
        request.message +
        '';
      userStore.showAppMessage = true;

      router.replace({ path: '/login' });
      return;
    }
    showSpinnerLoading.value = false;
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

  let activeSheetOptions = computed(() => {
    if (
      activeSheet.value != undefined &&
      activeSheet.value.options != undefined
    ) {
      return true;
    } else {
      return false;
    }
  });

  let activeSheetScaleOptions = computed(() => {
    if (
      activeSheet.value != undefined &&
      activeSheet.value.scale != undefined &&
      activeSheet.value.scale.options != undefined
    ) {
      return true;
    } else {
      return false;
    }
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
        scale.options != '' &&
        typeof scale.options != 'object'
      ) {
        console.log('options - scale.options', scale.options);
        newSheet['options'] = JSON.parse(scale.options);
      }

      scalesObject[key] = newSheet;
    }
    return scalesObject;
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
        battery.options != '' &&
        typeof battery.options != 'object'
      ) {
        console.log('options - battery.options', battery.options);
        newBattery['options'] = JSON.parse(battery.options);
        console.log('options - battery.options - done', battery.options);
      }

      batteriesObject[newBattery.batteryId] = newBattery;
    }
    return batteriesObject;
  });

  let sheetsNoRandom = computed(() => {
    let sheetsArray = [];
    let allSheets = questionsStore.sheetsInitial;

    for (const [key, sheet] of Object.entries(allSheets)) {
      let newSheet = sheet;

      // Adding the options string as an Object
      if (
        sheet != undefined &&
        sheet.options != undefined &&
        sheet.options != '' &&
        typeof sheet.options != 'object'
      ) {
        console.log('options - sheet.options', sheet.options);
        newSheet['options'] = JSON.parse(sheet.options);
      }

      // Adding scales to each sheet
      if (
        scales.value != undefined &&
        sheet.scaleId != undefined &&
        sheet.scaleId != ''
      ) {
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
    let attentionPageIndex;

    for (const [key, sheet] of Object.entries(allSheets)) {
      // console.log('QInitial - sheets 2 - key:', key, sheet);
      let battery = batteries.value[sheet.batteryId];

      // getting the Index of the attentioncheck Page
      if (sheet.options != undefined && sheet.options.attentionCheck === true) {
        console.log('attentionPageOriginalIndex:', key);
        attentionPageIndex = key;
      }
      //END getting the Index of the attentioncheck Page

      if (lastBatteryId != sheet.batteryId || i == allSheetLength) {
        // a new Battery starts or its last battery
        // if its last item, add last item to batteryArray

        // function batteryArrayToSheetsArray(){
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
        // }
        if (i === allSheetLength) {
          // last item gets put in batteryArray
          batteryArray.push(sheet);

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
      }

      // batteryArray.push(sheet);

      // if (i == allSheetLength) {
      //   // its the last sheet
      //   for (battery of batteryArray) {
      //     sheetsArray.push(battery);
      //   }
      // }

      if (i != allSheetLength) {
        // If not Last item, Item gets put in batteryArray. If it was last Item it was put in batteryArray further up
        batteryArray.push(sheet);
      }

      lastBatteryId = sheet.batteryId;
      i++;
    }
    // randomInt for putting the random page somewhere
    // let randomInt = getRandomInt(sheetsArray.length - 1);
    let randomInt;
    let validRandom = false;
    while (validRandom === false) {
      randomInt = getRandomInt(sheetsArray.length - 1);
      console.log('randomInt: ', randomInt);
      if (sheetsArray[randomInt]?.options?.excludeAttention != true) {
        console.log('randomInt - sheet:', sheetsArray[randomInt]);
        validRandom = true;
      } else {
        console.log('randomInt - excludeFromRandom:', randomInt);
      }
    }

    console.log('randomInt:', randomInt);
    // putting the random page somewhere

    // splice(start,deleteCount, item1, item2 ...)
    if (attentionPageIndex != undefined) {
      console.log(
        'SheetsArray ',
        sheetsArray,
        sheetsArray[Number(attentionPageIndex)],
        sheetsArray[Number(attentionPageIndex) + 1],
        sheetsArray[Number(attentionPageIndex) - 1],
        attentionPageIndex
      );
      console.log('SheetsArray - allSheets: ', allSheets);
      sheetsArray.splice(randomInt, 0, sheetsArray[Number(attentionPageIndex)]);
      sheetsArray.splice(Number(attentionPageIndex) + 1, 1);
    }

    // End putting the random page somewhere

    let j = 1;
    for (const [index, sheet] of Object.entries(sheetsArray)) {
      // Adding a sheetId to every sheet
      sheet['sheetId'] = Number(index) + 1;
      if (sheet.itemId != '') {
        // Adding a itemOrderNr only to questions/items
        sheet['orderId'] = j;
        j++;
      }
    }

    return sheetsArray;
  });

  watch(activeSheet, (newValue) => {
    if (
      newValue != undefined &&
      newValue.options != undefined &&
      newValue.options.defaultValue != undefined &&
      answers.entries[newValue.itemId] === undefined
    ) {
      // sets a default value if the item has the option defaultValue, for example a slider to 50 or multi Questions to [] or radio+free field to []
      answers.entries[newValue.itemId] = newValue.options.defaultValue;
    }

    // start timer 3
    if (
      newValue != undefined &&
      newValue.options != undefined &&
      newValue.options.timer === 3 &&
      time3.value != 0
    ) {
      console.log('timer3 trigger');
      timer3();
    }
    // end start timer 3

    // sets default value
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

  //  watch(sheets, (newValue) => {

  //   if (
  //     newValue != undefined &&
  //     newValue.options != undefined &&
  //     newValue.options.defaultValue != undefined &&
  //     answers.entries[newValue.itemId] === undefined
  //   ) {
  //     // sets a default value if the item has the option defaultValue, for example a slider to 50
  //     answers.entries[newValue.itemId] = newValue.options.defaultValue;
  //   }

  //  })

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
      activeSheet.value.scale.options.timerSec != undefined &&
      activeSheet.value.options.inputDisabled != true &&
      answers.unchangeable[activeSheet.value.itemId] === undefined
      // last condidion makes sure that the example sheet before the timer questions does not start the timer
    ) {
      time.value = activeSheet.value.scale.options.timerSec;
      timer();
    }
  }

  function getRange(start, end) {
    let arr = [];
    for (var i = end; i >= start; i--) arr.push(i);
    console.log('getRange', arr);
    return arr;
  }

  async function validateNrInput(target: any, itemId: any, event: any) {
    const value = target.value;
    console.log('validateNrInput - target', target);
    console.log('validateNrInput - event', event);
    console.log(
      'validateNrInput - target.maxlength',
      target.getAttribute('maxlength')
    );
    console.log('validateNrInput - itemId', itemId);

    if (value.length <= target.getAttribute('maxlength')) {
      console.log('value <=', value);
      if (event.data >= 0 && event.data <= 9) {
        answers.entries[itemId] = Number(value);
      } else {
        target.value = answers.entries[itemId];
      }
    } else {
      target.value = answers.entries[itemId];
    }
  }

  async function changeInputToNr(target: any, itemId: any, event: any, zeros) {
    const value = target.value;
    console.log('changeInputToNr - target', target);
    console.log('changeInputToNr - event', event);
    console.log(
      'changeInputToNr - target.maxlength',
      target.getAttribute('max')
    );
    console.log('changeInputToNr - itemId', itemId);

    if (zeros === 'noZero' && Number(value) === 0) {
      answers.entries[itemId] = undefined;
    } else {
      answers.entries[itemId] = Number(value);
    }
  }

  // numberWithDropdownInput

  function setAllAnswers() {
    for (let [key, question] of Object.entries(sheets.value)) {
      console.log('QuestionInitialPage - setAllAnswers', key, question);

      if (question.itemId != '') {
        if (
          question.options != undefined &&
          question.options.defaultValue != undefined
        ) {
          answers.entries[question.itemId] = question.options.defaultValue;
        } else {
          answers.entries[question.itemId] = 1;
        }
      }
    }
    currentSheet.value = sheets.value.length;
  }

  let time = ref();
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

  let showTimer = computed(() => {
    if (
      activeSheet.value.scale != undefined &&
      activeSheet.value.scale.options != undefined &&
      activeSheet.value.scale.options.showTimer === true
    ) {
      return true;
    } else {
      return false;
    }
  });

  let timerRuns = ref(false);

  function timer() {
    timerRuns.value = true;
    // 5sec - Timer
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
      time.value = 0;
      timerRuns.value = false;
      nextSheet();
    }
  }

  function timer3() {
    // 3sec Timer
    showTimer3.value = true;
    console.log('QuestionInitialPage - timer - time', time3.value);

    if (time3.value >= 0.1) {
      time3.value = time3.value - 0.1;
      //console.log(timer);
      setTimeout(timer3, 100); /* replicate wait 1 second */
    } else {
      time3.value = 0;
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
      if (response.status != 200 && response.status != 201) {
        userStore.appMessage =
          'Es gab einen Fehler!<br> Bitte senden Sie den Fragebogen erneut und überprüfen Sie ob Sie online sind. <br><br> Code: ' +
          response.code +
          '<br>Message: ' +
          response.message +
          '';
        userStore.showAppMessage = true;

        // router.replace('/login');
        showBackHomeButton.value = true;
        return;
      }
      resetAllAnswers();
      if (platform != 'web') {
        router.replace({ path: '/briefing-short' });
      } else {
        router.replace({ path: '/home' });
      }
    });
  }

  const showBackHomeButton = ref(false);

  function backHome() {
    console.log('QuestionShortPage - backHome');
    showBackHomeButton.value = false;
    resetAllAnswers();
    router.replace({ path: '/home' });
  }

  function resetAllAnswers() {
    // console.log('QuestionShortPage - setAllAnswers', key, question);
    // answers.entries = { 6: [], 53: [] };
    answers.entries = {};
    answers.unchangeable = {};
    currentSheet.value = 0;
    questionsStore.timestampQuestionsInitialStarted = 0;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  let freeFieldToAnswersText = ref({});

  function freeFieldToAnswers(target, itemId, event) {
    let value = target.value;
    let eventNew = event;
    console.log('freeFieldToAnswers - 1 - value', value);
    console.log('freeFieldToAnswers - 2 - eventNew', eventNew);
    if (/^[a-zA-Z ]+$/.test(eventNew.data)) {
      // answers.entries[itemId][1] = value;
      freeFieldToAnswersText.value[itemId] = value;
      console.log(
        'freeFieldToAnswers - 3 - freeFieldToAnswersText.value',
        freeFieldToAnswersText.value
      );
    } else {
      console.log('freeFieldToAnswers - 4 - else');
      target.value = answers.entries[itemId][1];
    }
    if (answers.entries[itemId][1] === '') {
      console.log('freeFieldToAnswers - 5 - if');
      answers.entries[itemId] = [];
    }
  }

  // function freeFieldToAnswersNumber(target, itemId, event) {
  //   let value = Number(target.value);
  //   console.log('freeFieldToAnswers - value', value);
  //   console.log('freeFieldToAnswers - event', event);
  //   if (/^[a-zA-Z ]+$/.test(event.data)) {
  //     answers.entries[itemId][1] = value;
  //     freeFieldToAnswersObj.value[itemId].number = value;
  //   } else {
  //     target.value = answers.entries[itemId][1];
  //   }
  // }

  // let freeFieldToAnswersValueNumber = ref();

  // function setQuestion2input() {
  //   console.log('setQuestion2input');
  //   answers.entries[2] = freeFieldToAnswersValue.value;
  // }
</script>

<style scoped>
  .progress {
    min-height: 15px;
  }
  .progress_bar {
    border-color: var(--ion-color-secondary);
    border: 2px solid;
    width: 50%;
    height: 10px;
    margin-left: auto;
    margin-right: auto;
    box-sizing: content-box;
    border-radius: 10px;
  }

  .progress_bar_inner {
    background-color: var(--ion-color-primary);
    height: 10px;
    border-radius: 5px 0px 0px 5px;
  }

  .buttons_wrapper {
    /* position: sticky; */
    max-width: 100%;
    width: 100%;
    /* bottom: 0; */
    /* padding-bottom: 10px; */
    /* left: 0; */
    /* margin-top: auto; */
  }

  /* .ios .buttons_wrapper{
    padding
  } */

  .buttons .next,
  .buttons .previous {
    /* position: sticky !important; */
  }

  .buttons .next {
    /* bottom: 150px; */
  }

  .scaleText {
    margin-right: auto;
    margin-left: 10px;
  }

  .margin-top {
    margin-top: auto;
  }

  .margin-top-zero {
    margin-top: 0 !important;
  }

  .freeFieldToAnswers {
    margin-bottom: 20px;
  }

  .yes {
    margin-right: auto;
    margin-left: auto;
    display: flex;
  }

  /* .admin {
    position: absolute;
    top: 0;
    left: 0;
  } */

  /* sheet without buttons */
  /* .sheet_content_wrapper {
    display: flex;
    flex-direction: column;
    height: 76vh;
    overflow: scroll;
  } */

  .item_text {
    min-height: 122px;
  }

  .item_text_scale {
    font-size: 22px;
    color: var(--ion-color-primary);
    font-family: 'Roboto-Slab';
    margin-bottom: 50px;
  }

  .height_zero {
    height: 0px !important;
    display: none !important;
  }

  .invisible {
    visibility: hidden;
  }
</style>
