<template>
  <ion-footer collapse="fade" class="dev">
    <ion-toolbar>
      <div class="padding">
        <div class="footer_icons dev">
          <div class="home">
            <router-link to="/home">
              <div class="home_icon home"><Icon :icon="home" /></div>
            </router-link>
          </div>
          <div class="suche">
            <router-link to="/questionsinitial">
              <div class="home_icon">
                <Icon :icon="search" />
              </div>
            </router-link>
          </div>
          <div class="refresh">
            <router-link to="/login">
              <div class="home_icon">
                <Icon :icon="refresh" />
              </div>
            </router-link>
          </div>
          <div class="benachrichtigungen">
            <router-link to="/success">
              <div class="home_icon">
                <Icon :icon="bell" />
              </div>
            </router-link>
          </div>

          <div class="development display_none dev">
            <div
              class="home_icon"
              @click="userStore.showDevbox = !userStore.showDevbox"
            >
              <Icon :icon="browser" />
            </div>
          </div>
        </div>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup>
  import {
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
  } from '@ionic/vue';
  import { defineComponent } from 'vue';
  import { homeOutline } from 'ionicons/icons';

  import { chevronBackOutline, personCircleOutline } from 'ionicons/icons';

  import { reactive, computed } from 'vue';
  import { ref, onMounted, watch } from 'vue';

  import { IonFooter } from '@ionic/vue';
  import { Icon } from '@iconify/vue';
  import home from '@iconify-icons/codicon/home';
  import search from '@iconify-icons/codicon/search';
  import bell from '@iconify-icons/codicon/bell';
  import refresh from '@iconify-icons/codicon/refresh';
  import browser from '@iconify-icons/codicon/browser';

  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();
</script>

<style scoped>
  a {
  }
  .testdata {
    font-size: 6px;
  }
  .padding {
    padding: 0px 30px;
  }
  ion-toolbar {
    --background: var(--ion-color-light-shade);
  }

  .footer_icons {
    font-size: 30px;
    font-weight: 800;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
    align-items: center;
  }

  .footer_icons a,
  .footer_icons {
    /* color: var(--ion-color-primary-contrast); */
    color: white;
  }

  .home_icon {
    width: 30px;
    height: 30px;
  }

  .home_icon.home {
    font-size: 35px;
  }
</style>
