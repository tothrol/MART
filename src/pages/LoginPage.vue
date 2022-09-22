<template>
  <base-layout>
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
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useRouter, useRoute } from 'vue-router';
  import { useQuestionsStore } from '@/stores/questionsStore';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const router = useRouter();

  function checkLogin() {
    if (
      loginData.name.length > 4 &&
      loginData.name.length < 30 &&
      loginData.password.length > 4 &&
      loginData.password.length < 30 &&
      loginData.uniqueUserId.length > 4 &&
      loginData.uniqueUserId.length < 30
    ) {
      return false;
    } else return true;
  }

  async function login() {
    console.log('LoginPage - 1');
    const response = await userStore.login(
      loginData.name,
      loginData.password,
      loginData.uniqueUserId
    );
    console.log('LoginPage - 2');
    console.log('LoginPage - response', response);
    if (response.status == 200) {
      console.log('LoginPage - 3');

      const initialAnswerResponse =
        await questionsStore.checkIfInitalAnswerExists();
      if (initialAnswerResponse.status == 200) {
        console.log('LoginPage - 4', initialAnswerResponse);
        console.log('LoginPage - Before Route -', userStore.userData.token);
        router.push('/home');
      }
    }
  }

  // function login() {
  //   const response = userStore.login(loginData.name, loginData.password);
  //   console.log('LoginPage - response', response);
  // }

  let loginData = reactive({ name: '', password: '', uniqueUserId: '' });

  async function checkAuth() {
    const isAuth = await userStore.checkAuth();
    console.log('Login', isAuth);

    if (isAuth == true) {
      console.log('Login - push', isAuth);
      router.push('/home');
    }
  }

  onMounted(() => {
    checkAuth();
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
</style>
