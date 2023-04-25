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
      <div class="flex column wrap m-b-1">
        <div class="m-b-2">Bildschirmzeit:</div>
        <div class="flex row wrap">
          <div>
            <input
              min="0"
              max="999"
              @input="validateNrInput($event.target, 'hours')"
              type="number"
            />
            Stunden
          </div>
          <div>
            <input
              min="0"
              max="59"
              @input="validateNrInput($event.target, 'minutes')"
              type="number"
            />
            Minuten
          </div>
        </div>
      </div>
      <div class="flex column wrap m-b-1">
        <div class="m-b-2">Aktivierungen:</div>
        <div>
          <input
            min="0"
            max="9999"
            @input="validateNrInput($event.target, 'activations')"
            type="number"
          />
        </div>
      </div>

      <ion-button
        @click="onNext()"
        color="secondary"
        :disabled="
          (iosStats.hours === 0 && iosStats.minutes === 0) ||
          iosStats.activations === 0
        "
        >Weiter</ion-button
      >
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

  const router = useRouter();

  const userStore = useUserStore();
  const statsStore = useStatsStore();
  let platform = Capacitor.getPlatform();

  let iosStats = reactive({ hours: 0, minutes: 0, activations: 0 });
  // let aktivierungen = ref('');

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

  async function validateNrInput(target: any, item: any) {
    const value = Number(target.value);
    // console.log('target', target);
    console.log('target value', value);
    // console.log('target value.length', value.length);
    // console.log('target.maxlength', target.getAttribute('maxlength'));
    console.log('target.max', target.getAttribute('max'));
    // console.log('target itemId', itemId);

    if (
      value <= Number(target.getAttribute('max')) &&
      value >= Number(target.getAttribute('min'))
    ) {
      console.log('target value <=', value);
      iosStats[item] = Number(value);
    } else {
      target.value = iosStats[item];
    }
    console.log('target iosStats', iosStats);
  }
</script>

<style scoped>
  #main {
    position: relative;
  }
  .modal {
    position: absolute;
    top: 5vh;
    padding: 20px;
    background: var(--ion-color-secondary);
    box-shadow: var(--box_shadow);
    max-height: 90vh;
    height: 100%;
    max-width: 600px;
    width: 100%;
    border-radius: 20px;
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
    justify-items: center;
    width: 100%;
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

  input {
    background: white;
    width: 80px;
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
