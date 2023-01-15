<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
  import { IonApp, IonRouterOutlet } from '@ionic/vue';
  import { defineComponent } from 'vue';
  import { useBackButton, useIonRouter } from '@ionic/vue';
  import { App } from '@capacitor/app';

  // START Back Button exit App
  const ionRouter = useIonRouter();
  useBackButton(-1, () => {
    console.log('BaseLayout - ionRouter', ionRouter);
    console.log('BaseLayout - ionRouter.canGoBack()', ionRouter.canGoBack());
    console.log('BaseLayout - App', App);
    if (ionRouter.canGoBack() === false) {
      console.log('BaseLayout - ionRouter - exitApp');
      // App.exitApp();
    }
  });
  // END Back Button exit App

  // export default defineComponent({
  //   name: 'App',
  //   components: {
  //     IonApp,
  //     IonRouterOutlet,
  //   },
  //   config: {
  //     productionTip: false,
  //   },
  // });
</script>
