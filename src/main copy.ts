import { createApp } from 'vue';
import App from './App.vue';
import BaseLayout from './components/base/BaseLayout.vue';
import router from './router';

import { IonicVue, IonButton } from '@ionic/vue';
// import { createPinia } from 'pinia';
import pinia from './stores/store';
import checkAuth from './plugins/checkAuth';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './assets/styles/main.css';
// import { SplashScreen } from '@capacitor/splash-screen';

// async function initSplash() {
//   // Hide the splash (you should do this on app launch)
//   await SplashScreen.hide();

//   // // Show the splash for an indefinite amount of time:
//   // await SplashScreen.show({
//   //   autoHide: false,
//   // });

//   // Show the splash for two seconds and then automatically hide it:
//   await SplashScreen.show({
//     showDuration: 2000,
//     autoHide: true,
//   });
// }
// initSplash();

const options = {
  animated: false,
};

// to use pinia In the Router, i need to access it in the router/index file
// Pinia is needet in the Router to check for the token
// const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue, options)

  .use(router)
  .use(pinia)

  .use(checkAuth);

app.component('base-layout', BaseLayout);
app.component('ion-button', IonButton);

app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('ion-');
};

router.isReady().then(() => {
  app.mount('#app');
});
