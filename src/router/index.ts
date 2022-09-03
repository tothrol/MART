import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import Login from '../pages/LoginPage.vue';
import DayJS from '../pages/examples/DayJSPage.vue';
import QuestionsInitial from '../pages/QuestionsInitialPage.vue';
import QuestionsShort from '../pages/QuestionsShortPage.vue';
import Success from '../pages/SuccessPage.vue';

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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
