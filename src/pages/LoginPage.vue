<template>
  <base-layout :fullscreen="true">
    <div class="box">
      <div class="text_big">Willkommen<br /></div>
      <input
        :class="{ show: adminSubstring }"
        class="username"
        type="text"
        v-model="loginData.name"
        placeholder="Benutzername"
      />
      <input type="text" placeholder="ID" v-model="loginData.uniqueUserId" />
      <input
        type="password"
        v-model="loginData.password"
        placeholder="Passwort"
      />

      <ion-button @click="login()" :disabled="checkLogin()"
        >Anmelden</ion-button
      >
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, watch, toRaw, computed } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import { Capacitor } from '@capacitor/core';

  let platform = Capacitor.getPlatform();

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

  let adminSubstring = computed(() => {
    let substring = loginData.value.uniqueUserId.substring(0, 4);
    console.log('LoginPage - adminsubstring', substring);

    if (substring === 'adm-') {
      return true;
    } else {
      return false;
    }
  });

  function checkLogin() {
    // if (
    //   loginData.value.name.length > 4 &&
    //   loginData.value.name.length < 30 &&
    //   loginData.value.password.length > 4 &&
    //   loginData.value.password.length < 30 &&
    //   loginData.value.uniqueUserId.length > 4 &&
    //   loginData.value.uniqueUserId.length < 30
    // ) {
    //   return false;
    // } else {
    //   return true;
    // }
    return false;
  }

  async function login() {
    console.log('LoginPage - login');
    const response = await userStore.login(
      loginData.value.name,
      loginData.value.password,
      loginData.value.uniqueUserId
    );

    console.log('LoginPage - login - response', response);
    if (response.status == 200) {
      if (questionsStore.initialAnswerExist === true || platform === 'web') {
        console.log('LoginPage - initialAnswerExist === true');
        // console.log('LoginPage - Before Route -', userStore.userData.token);

        router.replace({ path: '/home' });
      } else {
        console.log(
          'LoginPage - router.replace - welcome - platform: ',
          platform
        );
        router.replace({ path: '/welcome' });
      }
    } else if (response.status != 200) {
      // userStore.appMessage =
      //   'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut! <br><br> Code: ' +
      //   response.code +
      //   '<br>Message: ' +
      //   response.message +
      //   '';
      userStore.appMessage =
        'Name oder Passwort falsch, bitte erneut versuchen.';

      router.replace({ path: '/login' });
      return;
    }
  }

  // function login() {
  //   const response = userStore.login(loginData.value.name, loginData.value.password);
  //   console.log('LoginPage - response', response);
  // }

  let loginData = ref({ name: 'user', password: '', uniqueUserId: '' });

  loginData.value.uniqueUserId = toRaw(userStore.uniqueUserId);

  watch(
    () => userStore.uniqueUserId,
    () => {
      loginData.value.uniqueUserId = toRaw(userStore.uniqueUserId);
    }
  );

  async function atAppStart() {
    const isAuth = await userStore.atAppStart();
    console.log('LoginPage - atAppStart', isAuth);

    if (isAuth == true) {
      console.log('LoginPage - atAppStart - Token exists', isAuth);

      if (platform === 'web') {
        // START to simulate Mobile: comment out
        // userStore.complianceAccepted = true;
        // userStore.briefingShortChecked = true;
        // questionsStore.initialAnswerExist = true;
        // END to simulate Mobile: comment out
      }

      if (userStore.complianceAccepted === false && platform != 'web') {
        router.replace({ path: '/welcome' });
      } else {
        router.replace({ path: '/home' });
      }
    }
  }

  onMounted(() => {
    atAppStart();
  });
</script>

<style scoped>
  input {
    background: white;
    margin-bottom: 20px;
    border-radius: 5px;
    border-color: var(--light_grey);
    box-shadow: none !important;
    margin-right: auto;
    margin-left: auto;
    height: 45px;
    max-width: 300px;
    width: 100%;
    font-weight: 500;
    color: var(--ion-color-secondary);

    background: white;
    padding: 0 10px;
  }

  .text_big {
    margin-bottom: 50px;
  }

  .home {
    display: none !important;
  }

  .box.blue {
    min-height: 99vh;
  }

  .username {
    visibility: hidden;
  }

  .username.show {
    visibility: visible;
  }
</style>
