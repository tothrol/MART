<template>
  <ion-page id="main-content">
    <transition name="menu">
      <menu-component
        content-id="main-content"
        v-if="showMenu"
        @toggleMenu="showMenu = !showMenu"
      >
      </menu-component>
    </transition>
    <header-component
      v-if="props.fullscreen != true"
      @toggleMenu="showMenu = !showMenu"
    ></header-component>

    <ion-content ref="myContent" :scrollTop="scrollTop">
      <div id="main">
        <slot></slot>
      </div>
    </ion-content>
    <footer-component v-if="props.fullscreen != true"></footer-component>
    <transition>
      <messagebox-component name="fade" v-if="userStore.appMessage != ''"
        ><p v-html="userStore.appMessage" style="white-space: pre-line"></p
      ></messagebox-component>
    </transition>
  </ion-page>
</template>

<script setup lang="ts">
  import { IonPage } from '@ionic/vue';
  import { defineComponent, ref, defineExpose, defineProps } from 'vue';
  import { IonContent, ionMenu } from '@ionic/vue';
  import {
    chevronBackOutline,
    personCircleOutline,
    menuOutline,
  } from 'ionicons/icons';
  import HeaderComponent from '@/components/base/HeaderComponent.vue';
  import FooterComponent from '@/components/base/FooterComponent.vue';
  import MessageboxComponent from '@/components/MessageboxComponent.vue';
  import type { InjectionKey } from 'vue';
  import MenuComponent from '../MenuComponent.vue';
  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();

  // Scroll
  const myContent = ref(null);

  defineExpose({ scrollTop });

  let props = defineProps({ fullscreen: Boolean });

  function scrollTop() {
    console.log('ScrollThat');
    myContent.value.$el.scrollToPoint(0, 0, 300);
  }

  let showMenu = ref(false);
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

  /* MENU */

  .menu_icon {
    width: 40px;
    font-size: 40px;
    display: block;
    margin: 0;
  }

  .menu-enter-active,
  .menu-leave-active {
    transition: all 0.3s ease;
  }

  .menu-enter-from {
    transform: translateX(100vw);
  }
  .menu-leave-to {
    transform: translateX(100vw);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* END Menu */
</style>
