// import { useUserStore } from '@/stores/userStore';
// import { useRouter, useRoute, createRouter } from 'vue-router';
// const router = useRouter();

export default {
  install: (app: any) => {
    // const userStore = useUserStore();
    // const router = useRouter();
    console.log('Check Auth Plugin', app);

    // if (userStore.userData.token.length <= 1) {
    //   router.beforeEach((to: any, from: any) => {
    //     return false;
    //   });
    // }
  },
};
