<template>
  <base-layout :fullscreen="true">
    <div class="box blue">
      <div class="text_big">Willkommen<br /></div>
      <input type="text" v-model="loginData.name" placeholder="Benutzername" />
      <input
        type="password"
        v-model="loginData.password"
        placeholder="Passwort"
      />
      <input
        type="text"
        placeholder="Teilnehmer ID"
        v-model="loginData.uniqueUserId"
      />
      <ion-button @click="login()" :disabled="checkLogin()"
        >Anmelden</ion-button
      >
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import { Capacitor } from '@capacitor/core';

  let platform = Capacitor.getPlatform();

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

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
      if (questionsStore.initialAnswerExist === true) {
        console.log('LoginPage - initialAnswerExist === true');
        // console.log('LoginPage - Before Route -', userStore.userData.token);

        router.push('/home');
      } else {
        router.push('/welcome');
      }
    } else if (response.status != 200) {
      userStore.appMessage =
        'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut! <br><br> Code: ' +
        response.code +
        '<br>Message: ' +
        response.message +
        '';

      router.push('/login');
      return;
    }
  }

  // function login() {
  //   const response = userStore.login(loginData.value.name, loginData.value.password);
  //   console.log('LoginPage - response', response);
  // }

  let loginData = ref({ name: '', password: '', uniqueUserId: '' });

  loginData.value.uniqueUserId = userStore.uniqueUserId;

  watch(
    () => userStore.uniqueUserId,
    () => {
      loginData.value.uniqueUserId = userStore.uniqueUserId;
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

      if (userStore.complianceAccepted === false) {
        router.push('/welcome');
      } else {
        router.push('/home');
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
</style>
