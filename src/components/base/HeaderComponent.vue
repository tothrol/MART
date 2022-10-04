<template>
  <ion-header :translucent="false">
    <ion-toolbar>
      <ion-buttons slot="start">
        <router-link class="back_button_link" to="home">
          <ion-icon
            v-show="$route.path != '/home'"
            id="back_button"
            text=""
            :icon="chevronBackOutline"
          ></ion-icon
        ></router-link>
      </ion-buttons>
      <div id="logo">
        <router-link to="/home">
          <img
            @click="updateShort()"
            class="logo"
            src="@/assets/images/Logo.svg"
          />
        </router-link>
      </div>

      <ion-title id="title" v-if="!showLogo" class="title" slot="">{{
        pageTitle
      }}</ion-title>

      <slot></slot>

      <ion-icon
        @click="$emit('toggleMenu')"
        class="menu_icon"
        slot="end"
        :icon="menuOutline"
      ></ion-icon>

      <!-- <router-link to="/user" slot="end">
        <ion-icon class="settings_icon" :icon="personOutline"> </ion-icon>
      </router-link> -->
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
  import {
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonIcon,
  } from '@ionic/vue';
  import { defineComponent } from 'vue';
  // import MenuComponent from '@/components/MenuComponent.vue';

  import {
    chevronBackOutline,
    personCircleOutline,
    settingsOutline,
    personOutline,
    menuOutline,
  } from 'ionicons/icons';

  import { reactive, computed } from 'vue';
  import { ref, onMounted, watch } from 'vue';

  import { useQuestionsStore } from '@/stores/questionsStore';
  const questionsStore = useQuestionsStore();

  function updateShort() {
    // questionsStore.getLastShortAnswer();
    // questionsStore.countShortAnswers();
  }
</script>

<style scoped>
  ion-toolbar {
    --background: white;
    padding-right: 10px;
    padding-left: 10px;
  }
  .toolbar-background {
    /* background-color: blue; */
  }
  #back_button {
    font-size: 40px;
    color: var(--grey) !important;
  }

  .user_icon,
  .settings_icon {
    font-size: 40px;
    border-radius: 50%;
    object-fit: cover;
    color: var(--grey) !important;
  }
  .menu_icon {
    width: 40px;
    font-size: 40px;
    display: block;
    margin: 0;
  }

  .settings_icon {
    font-size: 35px;
    margin-left: 10px;
  }
  .header-md::after {
    background-image: none !important;
  }

  #logo {
    margin-left: auto;
    margin-right: auto;
    width: 150px;
  }

  #title,
  #back_button {
    color: white;
  }

  .title {
    text-align: center;
  }
  #container {
    text-align: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  #container strong {
    font-size: 20px;
    line-height: 26px;
  }

  #container p {
    font-size: 16px;
    line-height: 22px;
    margin: 0;
  }

  #container a {
    text-decoration: none;
  }

  .back_button_link {
    min-width: 40px;
  }
</style>
