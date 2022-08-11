<template>
  <ion-page>
    <header-component></header-component>

    <ion-content>
      <div id="ic"><slot /></div
    ></ion-content>
    <footer-component></footer-component>
  </ion-page>
</template>

<script setup>
  import { IonPage } from '@ionic/vue';
  import { defineComponent } from 'vue';
  import { IonContent } from '@ionic/vue';
  import { chevronBackOutline, personCircleOutline } from 'ionicons/icons';
  import HeaderComponent from '@/components/base/HeaderComponent.vue';
  import FooterComponent from '@/components/base/FooterComponent.vue';
</script>

<style scoped>
  ion-content {
    --padding-end: 20px;
    --padding-start: 20px;
    --padding-top: 20px;
  }
</style>
