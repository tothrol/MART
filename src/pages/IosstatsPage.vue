<template>
  <base-layout :fullscreen="true"
    ><div class="box green">
      <p class="">
        Bitte navigieren Sie nun in Ihrem Telefon zu<br />
        <b>Einstellungen -> Bildschirmzeit</b><br />
        und geben Sie in das Eingabefeld unten den
        <b>Tagesdurchschnitswert</b> ein.
      </p>
      <div>
        <div>
          <input min="0" max="99" v-model="iosStats[0]" type="number" />
          Stunden
        </div>
        <div>
          <input min="0" max="60" v-model="iosStats[1]" type="number" />
          Minuten
        </div>
      </div>

      <ion-button @click="onNext()" color="secondary">Weiter</ion-button>
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

  const router = useRouter();

  const userStore = useUserStore();
  const statsStore = useStatsStore();

  let iosStats = ref([0, 0]);

  async function onNext() {
    let response = await statsStore.sendIosStats(iosStats.value);
    if (response.status != 200 && response.status != 201) {
      userStore.appMessage =
        'Es gab einen Fehler!<br> Bitte versuchen Sie es erneut und überprüfen Sie ob Sie online sind. <br><br> Code: ' +
        response.code +
        '<br>Message: ' +
        response.message +
        '';
    } else {
      router.replace('/success');
    }
  }
</script>

<style scoped>
  .box.green {
    height: 93vh !important;
  }
  p {
    font-size: 20px;
    margin-bottom: 50px;
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
