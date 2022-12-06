<template>
  <base-layout
    ><div class="box blue">
      <div class="user_infos">
        <div>User Name: {{ userStore.userData.username }}</div>
        <div>Version: Beta 7.0</div>
        <div></div>
      </div>
      <ion-button color="danger" @click="logout()">Logout</ion-button>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import messageBoxComponent from '@/components/MessageboxComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import router from '@/router';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();

  let showMessage = ref(true);

  function logout() {
    userStore.logout();
    router.push('/login');
  }
</script>

<style scoped>
  .user_infos {
    color: white;
    font-size: 20px;
    margin-bottom: 20px;
  }
</style>
