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
      <div id="logo" @click="adminMode()">
        <router-link class="link_home" to="/home">
          <img class="logo" src="@/assets/images/MART_Bold.png" />
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
  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();

  function updateShort() {
    // questionsStore.getLastShortAnswer();
    // questionsStore.countShortAnswers();
  }

  // START AdminMode
  let counterAdminMode = 0;

  function timeoutAdmin() {
    counterAdminMode = 0;
  }

  var timeoutAdminMode;

  function adminMode() {
    if (userStore.userData.username === 'nviiadmin') {
      if (counterAdminMode === 0) {
        timeoutAdminMode = setTimeout(timeoutAdmin, 3000);
      }
      counterAdminMode++;
      if (counterAdminMode === 5) {
        clearTimeout(timeoutAdminMode);
        userStore.showDevbox = true;
      }
      if (counterAdminMode > 5) {
        userStore.showDevbox = !userStore.showDevbox;
      }
    }
  }
  // END AdminMode
</script>

<style scoped>
  ion-toolbar {
    --background: white;
    padding-right: 10px;
    padding-left: 10px;
  }

  #logo a {
    text-decoration: none;
    color: var(--ion-color-secondary);
    /* font-size: 35px; */
    font-weight: 600;
    letter-spacing: 7px;
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
    width: 120px;
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

  .link_home {
    height: auto !important;
    display: flex;
    /* padding: 5px; */
  }
</style>
