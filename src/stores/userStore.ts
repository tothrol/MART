import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { Storage } from '@ionic/storage';

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
      uniqueUserId: 'startId',
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
        token: '',
      };
      if (validValue(data.id)) userData.id = data.id;
      if (validValue(data.email)) userData.email = data.email;
      if (validValue(data.username)) userData.username = data.username;
      if (validValue(data.firstname)) userData.firstname = data.firstname;
      if (validValue(data.lastname)) userData.lastname = data.lastname;
      if (validValue(data.token)) userData.token = data.token;

      this.userData = userData;
      if (validValue(data.uniqueUserId)) this.uniqueUserId = data.uniqueUserId;

      console.log(
        'store - updateUserData - this.userData, uniqueUserId',
        this.userData,
        this.uniqueUserId
      );
    },
    async logout() {
      this.userData = {
        id: 0,
        email: '',
        username: '',
        firstname: '',
        lastname: '',
        token: '',
      };
      this.showInitial = false;
      this.showQuestions = true;
      this.showDevbox = false;

      const storage = new Storage();
      await storage.create();
      await storage.remove('token');
      await storage.remove('email');
      await storage.remove('username');
      await storage.remove('id');
      await storage.remove('uniqueUserId');
    },

    async login(username: any, password: any, uniqueUserId: any) {
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
        this.uniqueUserId = uniqueUserId;

        const storage = new Storage();
        await storage.create();
        await storage.set('token', response.data.token);
        await storage.set('email', response.data.user_email);
        await storage.set('username', response.data.user_display_name);
        await storage.set('id', response.data.user_id);
        await storage.set('uniqueUserId', uniqueUserId);

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
    async checkAuth() {
      const storage = new Storage();
      await storage.create();
      const token = await storage.get('token');
      const id = await storage.get('id');
      const email = await storage.get('email');
      const username = await storage.get('username');
      const uniqueUserId = await storage.get('uniqueUserId');
      if (token) {
        const userData: any = {
          id: id,
          email: email,
          username: username,
          token: token,
          uniqueUserId: uniqueUserId,
        };
        this.updateUserData(userData);
        return true;
      } else return false;
    },
  },
  getters: {
    getUserData: (state) => state.userData,
  },
});
