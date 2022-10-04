import pinia from '../stores/store';
import { useUserStore } from '@/stores/userStore';
import { useQuestionsStore } from '@/stores/questionsStore';
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
import Welcome from '../pages/WelcomePage.vue';
import Compliance from '../pages/CompliancePage.vue';
import BriefingShort from '../pages/BriefingShortPage.vue';

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
  {
    path: '/welcome',
    component: Welcome,
  },
  {
    path: '/compliance',
    component: Compliance,
  },
  {
    path: '/briefing-short',
    component: BriefingShort,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

let programmatic = false;
['push', 'replace', 'go', 'back', 'forward'].forEach((methodName) => {
  const method = router[methodName];
  router[methodName] = (...args) => {
    programmatic = true;
    method.apply(router, args);
  };
});

// Needet to use Pinia outside of a component
const userStore = useUserStore(pinia);
const questionsStore = useQuestionsStore(pinia);
router.beforeEach(async (to: any, from: any) => {
  // const userData = userStore.getUserData;
  // console.log('Navigation guard ', userStore.userData.token);
  // console.log('Navigation guard to:', to, from, userStore.userData.token);
  // console.log('Navigation guard from:', from);
  // console.log('Navigation guard token:', userStore.userData);
  // console.log('Navigation guard userData:', userData);
  // console.log('Navigation guard token:', userStore.userData.token);
  // console.log('Navigation guard token:', userData.token);
  if (userStore.userData.token === '' && to.path !== '/login') {
    console.log('Navigation guard - no token');
    return '/login';
  } else {
    console.log('Navigation guard - token Exists');
    if (!from.name === null || !programmatic) {
      // do stuff you want to do when hitting back/forward or reloading page
      console.log('Navigation guard programmatic', to.path);
      if (to.path === '/questionsInitial') {
        if (questionsStore.initialAnswerExist === true) {
          console.log(
            'Navigation guard - token Exists questionsStore.initialAnswerExist === true'
          );
          return '/home';
          // next({ path: '/home' });
          // router.push('/home');
          // return '/home';
        }
      }
    }
    programmatic = false; // clear flag
  }
});

router.afterEach((to, from) => {
  console.log('Navigation guard - afterEach - 1');
  if (to.path === '/questionsInitial') {
    console.log('Navigation guard - afterEach - 2');
    if (questionsStore.initialAnswerExist === true) {
      console.log('Navigation guard - afterEach - 3');
      router.push('/home');
      // next({ path: '/home' });
      // router.push('/home');
      // return '/home';
    }
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
