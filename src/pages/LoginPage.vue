<template>
  <base-layout>
    <div>
      <input type="text" v-model="loginData.name" />
      <input type="password" v-model="loginData.password" />
      <ion-button @click="login()">Anmelden</ion-button>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useRouter, useRoute } from 'vue-router';

  const userStore = useUserStore();
  const router = useRouter();

  async function login() {
    const response = await userStore.login(loginData.name, loginData.password);
    console.log('LoginPage - response', response);
    if (response.status == 200) {
      router.push('/home');
    }
  }

  // function login() {
  //   const response = userStore.login(loginData.name, loginData.password);
  //   console.log('LoginPage - response', response);
  // }

  let loginData = reactive({ name: '', password: '' });
</script>
