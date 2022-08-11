import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';

export const useUserStore = defineStore('userStore', {
  state: () => {
    return {
      userData: {
        id: '',
        email: '',
        username: '',
        firstname: 'stefko',
        lastname: 'f',
      },
      loginData: {
        token: {},
        userRole: '',
        userId: '',
      },
    };
  },
  actions: {
    updateUserData(data) {
      console.log('store - updateUserData - data', data);

      let userData = {
        id: '',
        email: '',
        username: '',
        firstname: '',
        lastname: '',
      };
      if (validValue(data.id)) userData.id = data.id;
      if (validValue(data.email)) userData.email = data.email;
      if (validValue(data.username)) userData.username = data.username;
      if (validValue(data.firstname)) userData.firstname = data.firstname;
      if (validValue(data.lastname)) userData.lastname = data.lastname;

      this.userData = userData;

      console.log('store - updateUserData - this.userData', this.userData);
    },
    increaseTrigger() {
      this.trigger++;
    },
    resetUserData() {
      this.userData = { id: '', company: { id: '' }, avatar: { fullpath: '' } };
      this.loginData = {
        token: {},
        userRole: '',
        userId: '',
      };
    },
  },
  getters: {
    getUserData: (state) => state.userData,
    getTrigger: (state) => state.trigger,
  },
});
