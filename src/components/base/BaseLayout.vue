<template>
  <ion-page>
    <header-component></header-component>

    <ion-content ref="myContent" :scrollTop="scrollTop">
      <div id="main"><slot></slot></div>
    </ion-content>
    <footer-component></footer-component>
  </ion-page>
</template>

<script setup lang="ts">
  import { IonPage } from '@ionic/vue';
  import { defineComponent, ref, defineExpose } from 'vue';
  import { IonContent } from '@ionic/vue';
  import { chevronBackOutline, personCircleOutline } from 'ionicons/icons';
  import HeaderComponent from '@/components/base/HeaderComponent.vue';
  import FooterComponent from '@/components/base/FooterComponent.vue';
  import type { InjectionKey } from 'vue';

  // Scroll
  const myContent = ref(null);

  defineExpose({ scrollTop });

  function scrollTop() {
    console.log('ScrollThat');
    myContent.value.$el.scrollToPoint(0, 0, 300);
  }
  // End Scroll
</script>

<style scoped>
  ion-content {
    --padding-end: 5px;
    --padding-start: 5px;
    --padding-top: 5px;
  }
  #main {
    max-width: 600px;
    margin-right: auto;
    margin-left: auto;
    min-height: 100%;
    height: min-content;
    padding: 20px 0px;
  }
</style>
