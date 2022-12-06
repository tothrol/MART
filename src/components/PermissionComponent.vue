<template>
  <div class="permission_modal">
    <div class="box blue">
      <p class="text" v-if="showOk">
        Bitte im folgenden Dialogfeld der App die Erhebung von Nutzungsdaten
        erlauben
      </p>

      <ion-button v-if="showOk" class="ok_button" @click="setPermissions()"
        >OK</ion-button
      >
      <p class="text" v-if="showWeiter">
        Es geht nun weiter mit dem Fragebogen
      </p>
      <ion-button v-if="showWeiter" class="ok_button" @click="close()"
        >Weiter</ion-button
      >
    </div>
  </div>
</template>

<script setup>
  import { useStatsStore } from '@/stores/statsStore';
  import { ref, onMounted, defineProps } from 'vue';

  const props = defineProps(['closeModal']);

  //   const userStore = useUserStore();
  //   const questionsStore = useQuestionsStore();
  //   const router = useRouter();

  const statsStore = useStatsStore();

  const showWeiter = ref(false);
  const showOk = ref(true);

  async function setPermissions() {
    let result = await statsStore.checkAndSetAndroidPermissions();
    console.log('PermissionComponent -result ', result);

    setTimeout(function () {
      showWeiter.value = true;
      showOk.value = false;
    }, 2000);

    // checkPermissions()
  }

  async function close() {
    // let result = await statsStore.checkAndroidPermissions();
    // if (result != undefined && result.permission === 'NoPermission') {
    //   console.log('PermissionComponent -result ', result);
    // }

    // resetting modal
    showWeiter.value = false;
    showOk.value = true;

    props.closeModal();
  }
</script>

<style scoped>
  .permission_modal {
    height: 100vh;
    width: auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    background: white;
    max-width: 600px;
    padding: 5px;
  }

  .text {
    margin-top: 50px;
    font-size: 25px;
    text-align: center;
  }
  .ok_button {
    margin-top: 100px;
  }
</style>
