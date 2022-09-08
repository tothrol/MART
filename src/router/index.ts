import pinia from '../stores/store';
import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import Login from '../pages/LoginPage.vue';
import User from '../pages/UserPage.vue';
import DayJS from '../pages/examples/DayJSPage.vue';
import QuestionsInitial from '../pages/QuestionsInitialPage.vue';
import QuestionsShort from '../pages/QuestionsShortPage.vue';
import Answers from '../pages/AnswersPage.vue';
import Success from '../pages/SuccessPage.vue';

// Needet to use Pinia outside of a component

// import { useProcessStore } from '@/store/process';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: HomePage,
  },
  {
    path: '/dayjs',
    component: DayJS,
  },
  {
    path: '/questionsinitial',
    component: QuestionsInitial,
  },
  {
    path: '/questionsshort',
    component: QuestionsShort,
  },
  {
    path: '/success',
    component: Success,
  },
  {
    path: '/answers',
    component: Answers,
  },
  {
    path: '/user',
    component: User,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Needet to use Pinia outside of a component
const userStore = useUserStore(pinia);
router.beforeEach(async (to: any, from: any) => {
  const userData = userStore.getUserData;
  // console.log('Navigation guard to:', to, from, userStore.userData.token);
  // console.log('Navigation guard from:', from);
  // console.log('Navigation guard token:', userStore.userData);
  // console.log('Navigation guard userData:', userData);
  // console.log('Navigation guard showInitial:', userStore.showInitial);
  if (userStore.userData.token === '' && to.path !== '/login') {
    // console.log('Navigation guard - no token');
    return '/login';
  }
});

// router.beforeResolve(async (to) => {
//   const userStore = useUserStore(pinia);

//   const token = userStore.userData.token;

//   console.log('beforeResolve - token', token);
//   if (userStore.userData.token === '' && to.path !== '/login') {
//     console.log('Navigation beforeResolve - no token');
//     return '/login';
//   }
// });

export default router;
