<template>
  <div class="messagebox">
    <slot></slot>
    <div class="">
      <div class="ok" @click="onOk()">OK</div>
      <div class="home display_none" @click="onHome()">Home</div>
    </div>
  </div>
</template>

<script setup>
  import {} from '@ionic/vue';
  import { useUserStore } from '@/stores/userStore';
  import router from '@/router';

  const userStore = useUserStore();

  function onOk() {
    userStore.showAppMessage = false;
  }

  function onHome() {
    userStore.showAppMessage = false;
    router.replace({ path: '/home' });
  }
</script>

<style scoped>
  .messagebox {
    width: 95%;
    max-width: 560px;
    background: #0d0d0dbf;
    border-radius: 15px;
    padding: 10px 20px;
    position: fixed;
    bottom: 5px;
    z-index: 99999;
    right: 0;
    left: 0;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .ok,
  .home {
    /* margin-left: auto; */
    padding: 5px 20px;
    background: var(--ion-color-primary);
    cursor: pointer;
    border-radius: 50px;
    text-align: center;
    margin-bottom: 10px;
    margin-right: 10px;
  }

  .v-enter-active,
  .v-leave-active {
    transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .v-enter-from,
  .v-leave-to {
    bottom: -50px;
    opacity: 0;
  }

  /* .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  } */
</style>
