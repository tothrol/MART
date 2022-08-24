import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';

export const useUserStore = defineStore('userStore', {
  state: () => {
    return {
      userData: {
        id: 0,
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        token: '',
      },
      showInitial: false,
      showQuestions: true,
      showDevbox: false,
    };
  },
  actions: {
    updateUserData(data: any) {
      console.log('store - updateUserData - data', data);

      const userData: any = {
        id: 0,
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
    resetUserData() {
      this.userData = {
        id: 0,
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        token: '',
      };
    },

    async login(username: any, password: any) {
      try {
        const response = await axios.post(
          `https://fuberlin.nvii-dev.com/wp-json/jwt-auth/v1/token`,
          {
            username: username,
            password: password,
          }
        );

        // JSON responses are automatically parsed.
        console.log('userStore - login - response', response);

        this.userData.token = response.data.token;
        this.userData.email = response.data.user_email;
        this.userData.username = response.data.user_display_name;
        this.userData.id = response.data.user_id;

        return new Promise((resolve) => {
          // if (response.status == 200) {
          resolve(response);
          // }
        });
      } catch (e) {
        return new Promise((reject) => {
          // if (response.status == 200) {

          reject(e);
          // }
        });

        // console.log('userStore - login - e', e);
      }
    },
  },
  getters: {
    getUserData: (state) => state.userData,
  },
});
