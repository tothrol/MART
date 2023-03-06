<template>
  <div class="permission_modal">
    <div class="box blue">
      <p class="text" v-if="showOk">
        Bitte erlauben Sie <b>MART</b> das Anzeigen von Benachrichtigungen.<br /><br />
        Navigieren Sie hierzu nach Einstellungen -> Apps -> MART ->
        Benachrichtigungen.<br /><br />
        Sie können nur fortfahren, wenn Sie Benachrichtigungen erlauben.
      </p>

      <ion-button v-if="showOk" class="ok_button" @click="setPermissions()"
        >OK</ion-button
      >
      <!-- <p class="text" v-if="showWeiter">
        Es geht nun weiter mit dem Fragebogen
      </p>
      <ion-button v-if="showWeiter" class="ok_button" @click="close()"
        >Weiter</ion-button
      > -->
      <p class="text" v-if="showWeiter">
        Bitte tippen Sie nun auf Weiter, um fortzufahren.
      </p>
      <ion-button v-if="showWeiter" class="ok_button" @click="checkPermission()"
        >Weiter</ion-button
      >
    </div>
  </div>
</template>

<script setup>
  import { useStatsStore } from '@/stores/statsStore';
  import { ref, onMounted, defineProps } from 'vue';
  import { LocalNotifications } from '@capacitor/local-notifications';

  const props = defineProps(['closeNotificationPermissionModal']);

  //   const userStore = useUserStore();
  //   const questionsStore = useQuestionsStore();
  //   const router = useRouter();

  const statsStore = useStatsStore();

  const showWeiter = ref(false);
  const showOk = ref(true);

  async function setPermissions() {
    await LocalNotifications.requestPermissions().then(function (result) {
      console.log(
        'NotificationPermissionComponent - requestPermissions - result',
        result
      );
    });

    showWeiter.value = true;
    showOk.value = false;

    // checkPermissions()
  }

  async function checkPermission() {
    await LocalNotifications.checkPermissions().then(function (result) {
      console.log(
        'NotificationPermissionComponent - checkPermissions - result',
        result
      );

      if (result.display != undefined && result.display === 'granted') {
        close();
      } else {
        showWeiter.value = false;
        showOk.value = true;
      }
    });
  }

  async function close() {
    // let result = await statsStore.checkAndroidPermissions();
    // if (result != undefined && result.permission === 'NoPermission') {
    //   console.log('PermissionComponent -result ', result);
    // }

    // resetting modal
    showWeiter.value = false;
    showOk.value = true;

    props.closeNotificationPermissionModal();
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
    background-color: var(--ion-color-secondary);
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
