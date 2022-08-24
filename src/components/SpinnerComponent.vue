<template>
  <div class="spinner">
    <ion-spinner name="circles">v-if="showSpinner"</ion-spinner>
    <slot></slot>
  </div>
</template>

<script setup>
  import { IonSpinner } from '@ionic/vue';
</script>

<style scoped>
  .spinner {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    flex-direction: column;
    background: #b8b8b8b3;
    font-size: 20px;
    justify-content: center;
    align-items: center;
    top: 0px;
    right: 0;
    z-index: 999999;
    color: var(--ion-color-secondary);
  }

  ion-spinner {
    margin-bottom: 20px;
    color: var(--ion-color-secondary);
  }
</style>
