<template>
  <base-layout :fullscreen="true" backgroundColor="primary"
    ><div class="box">
      <p class="">
        Bitte öffnen Sie nun die Einstellungen Ihres iPhones. Tippen Sie dort
        auf den Menüpunkt <b>„Bildschirmzeit“</b>
        <span @click="showExample(1)"> (Beispiel)</span> und darin auf
        <b>„Alle Aktivitäten anzeigen“</b>
        <span @click="showExample(2)"> (Beispiel)</span>.<br /><br />
        Bitte merken Sie sich den Tagesdurchschnitt, der unter
        <b>„Bildschirmzeit“</b>
        <span @click="showExample(3)"> (Beispiel)</span> angezeigt wird.<br /><br />
        <b
          >Achtung: Bitte stellen Sie sicher, dass am oberen Rand "Wöchentlich"
          ausgewählt ist, nicht "Täglich", und dass Ihnen die aktuelle Woche
          angezeigt wird</b
        ><br /><br />
        Scrollen Sie dann herunter und merken Sie sich auch Ihren
        Tagesdurchschnitt, der unter <b>„Aktivierungen“</b>
        <span @click="showExample(4)"> (Beispiel)</span> angezeigt wird. Tragen
        Sie dann beide Informationen hier ein:<br /><br />
      </p>
      <div class="flex column wrap m-b-1 w100">
        <div class="m-b-2">Bildschirmzeit:</div>
        <div class="flex row wrap w100">
          <div class="flex row center-horizontal">
            <ion-item>
              <ion-input
                min="0"
                max="999"
                type="number"
                :value="iosStats.hours"
                @ionInput="validateNrInput($event, 'hours')"
              ></ion-input>
            </ion-item>

            <!-- <input
              min="0"
              max="999"
              @input="validateNrInput($event.target, 'hours')"
              type="number"
            /> -->
            <div class="label">Stunden</div>
          </div>
          <div class="flex row center-horizontal">
            <ion-item>
              <ion-input
                min="0"
                max="59"
                type="number"
                :value="iosStats.minutes"
                @ionInput="validateNrInput($event, 'minutes')"
              ></ion-input>
            </ion-item>

            <div class="label">Minuten</div>
          </div>
        </div>
      </div>
      <div class="flex column wrap m-b-1 aktivierungen">
        <div class="m-b-2">Aktivierungen:</div>
        <div>
          <ion-item>
            <ion-input
              min="0"
              max="9999"
              type="number"
              :value="iosStats.activations"
              @ionInput="validateNrInput($event, 'activations')"
            ></ion-input>
          </ion-item>
        </div>
      </div>

      <div class="display_none">{{ iosStats }}</div>
      <div class="weiter">
        <ion-button
          @click="onNext()"
          color="secondary"
          :disabled="
            ((iosStats.hours === 0 || iosStats.hours === '') &&
              (iosStats.minutes === 0 || iosStats.hours === '')) ||
            iosStats.activations === 0
          "
          >Weiter</ion-button
        >
      </div>
    </div>
    <div class="modal" v-if="showModal">
      <div class="closeModal" @click="closeModal">
        <ion-icon :icon="closeCircleOutline"></ion-icon>
      </div>
      <img :src="getsrc()" />
      <!-- <img src="@/assets/images/beispiel/beispiel1.jpg" /> -->
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { Icon } from '@iconify/vue';
  import heart from '@iconify-icons/codicon/heart-filled';
  import { useStatsStore } from '@/stores/statsStore';
  import { useRouter, useRoute } from 'vue-router';

  import { Capacitor } from '@capacitor/core';
  import { closeCircleOutline } from 'ionicons/icons';
  import { IonInput, IonItem, IonList } from '@ionic/vue';

  const router = useRouter();

  const userStore = useUserStore();
  const statsStore = useStatsStore();
  let platform = Capacitor.getPlatform();

  let iosStats = reactive({ hours: 0, minutes: 0, activations: 0 });
  const ionInputEl = ref();
  // let aktivierungen = ref('');

  async function validateNrInput(ev: any, item: any) {
    const value = Number(ev.target.value);
    // console.log('target', target);
    console.log('target value', value);
    // console.log('target value.length', value.length);
    // console.log('target.maxlength', target.getAttribute('maxlength'));
    console.log('target', ev.target);
    console.log('target.max', ev.target.getAttribute('max'));
    console.log('ev.target.max', Number(ev.target.max));
    // console.log('target itemId', itemId);

    if (value <= Number(ev.target.max) && value >= Number(ev.target.min)) {
      // input OK
      console.log('target value <=', value);
      iosStats[item] = value;

      //
      const inputCmp = ionInputEl.value;
      console.log('inputCmp', inputCmp);
      if (inputCmp !== undefined) {
        inputCmp.$el.value = value;
      }
      //
    } else {
      // input NOT OK
      console.log('target value bigger', value);

      console.log('ev.target: ', ev.target);
      console.log('ev.target.value: ', ev.target.value);
      console.log('iosStats[item] 1 : ', iosStats[item]);
      ev.target.value = iosStats[item];
      console.log('iosStats[item] 2 : ', iosStats[item]);

      //
      const inputCmp = ionInputEl.value;
      console.log('inputCmp', inputCmp);
      if (inputCmp !== undefined) {
        inputCmp.value = Number(value);
      }
      //
    }
    console.log('target iosStats', iosStats);
  }

  async function onNext() {
    if (platform === 'ios') {
      let response = await statsStore.sendIosStats(iosStats);
      if (response.status != 200 && response.status != 201) {
        userStore.appMessage =
          'Es gab einen Fehler!<br> Bitte versuchen Sie es erneut und überprüfen Sie ob Sie online sind. <br><br> Code: ' +
          response.code +
          '<br>Message: ' +
          response.message +
          '';
        userStore.showAppMessage = true;
      } else {
        router.replace({ path: '/success' });
      }
    } else {
      router.replace({ path: '/success' });
    }
  }

  let imgsrc = ref('');

  function showExample(nr) {
    imgsrc.value = nr;
    showModal.value = true;
  }

  function getsrc() {
    var images = require.context('../assets/images/beispiel/', false, /\.jpg$/);
    return images('./beispiel' + imgsrc.value + '.jpg');
  }

  let showModal = ref(false);

  function closeModal() {
    showModal.value = false;
  }
</script>

<style scoped>
  #main {
    position: relative;
  }

  .w100 {
    width: 100%;
  }

  .center-horizontal {
    align-items: center;
  }

  .aktivierungen {
    margin-right: auto;
  }

  .label {
    margin-left: 10px;
  }
  .modal {
    position: fixed;
    top: 5vh;
    padding: 20px;
    background: var(--ion-color-secondary);
    box-shadow: var(--box_shadow);
    max-height: 90vh;
    height: 100%;
    max-width: 600px;
    width: 100%;
    border-radius: 20px;
    z-index: 3;
  }

  .modal img {
    object-fit: contain;
  }

  .closeModal {
    position: absolute;
    top: 6px;
    right: 2px;
    font-size: 45px;
  }

  .weiter {
    padding-bottom: 20px;
    width: 100%;
    display: flex;
  }

  b {
    font-weight: 500;
  }

  .modal img {
    height: 100%;
  }
  p span {
    color: var(--ion-color-secondary);
    font-weight: 400;
    cursor: pointer;
  }
  .box {
    height: 93vh !important;
  }
  div {
    font-size: 20px;
  }

  .flex {
  }

  .m-b-1 {
    margin-bottom: 30px;
  }

  .m-b-2 {
    margin-bottom: 10px;
    font-weight: 500;
  }
  .flex div {
    margin-right: 15px;
  }
  p {
    font-size: 20px;
    margin-bottom: 10px;
    width: 100%;
  }
  .heart {
    color: white;
  }

  input,
  ion-item {
    background: white;
    width: 110px;
    border: none;
    margin-bottom: 5px;
    margin-left: 0px;
    font-size: 25px;
    line-height: 25px;
    border-radius: 5px;
  }

  ion-button {
    margin-top: auto;
  }

  .box svg {
    color: white;
    /* size: 50px; */
    /* width: 50px;
    height: 50px; */
    font-size: 40px;
  }
</style>
