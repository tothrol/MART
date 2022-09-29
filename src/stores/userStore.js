import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { Storage } from '@ionic/storage';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useInfoStore } from '@/stores/infoStore';

// import { useQuestionsStore } from '@/stores/questionsStore';

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
      showQuestions: false,
      showDevbox: false,
      uniqueUserId: 'startId',
      randomArray: [],
      complianceAccepted: false,
      briefingShortChecked: false,
    };
  },
  actions: {
    updateUserData(data) {
      console.log('store - updateUserData - data', data);

      const userData = {
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
      this.showQuestions = false;
      this.showDevbox = false;

      const storage = new Storage();

      await storage.create();
      await storage.remove('token');
      await storage.remove('email');
      await storage.remove('username');
      await storage.remove('id');

      // await storage.remove('uniqueUserId');
    },

    async login(username, password, uniqueUserId) {
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
        if (this.uniqueUserId != uniqueUserId) {
          console.log('NewUniqueUserID');
          const storage = new Storage();
          await storage.create();
          await storage.remove('randomArray');
          await storage.remove('complianceAccepted');
          await storage.remove('briefingShortChecked');
          this.complianceAccepted = false;
          this.briefingShortChecked = false;
          this.createRandomArray();

          this.uniqueUserId = uniqueUserId;
        }

        const storage = new Storage();
        await storage.create();
        await storage.set('token', response.data.token);
        await storage.set('email', response.data.user_email);
        await storage.set('username', response.data.user_display_name);
        await storage.set('id', response.data.user_id);
        await storage.set('uniqueUserId', uniqueUserId);

        const questionsStore = useQuestionsStore();

        questionsStore.checkIfInitalAnswerExists();
        questionsStore.getLastShortAnswer();
        questionsStore.countShortAnswers();

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
      // wird getriggert wenn auf /login zugegriggen wird
      const storage = new Storage();
      await storage.create();
      const token = await storage.get('token');
      const id = await storage.get('id');
      const email = await storage.get('email');
      const username = await storage.get('username');
      const uniqueUserId = await storage.get('uniqueUserId');

      const complianceAccepted = await storage.get('complianceAccepted');
      console.log('CheckAuth - complianceAccepted', complianceAccepted);
      if (complianceAccepted == true) {
        this.complianceAccepted = true;
      }

      this.uniqueUserId = uniqueUserId;
      if (token) {
        const userData = {
          id: id,
          email: email,
          username: username,
          token: token,
          uniqueUserId: uniqueUserId,
        };
        this.updateUserData(userData);
        this.createRandomArray();

        let briefingShortChecked = await storage.get('briefingShortChecked');
        if (briefingShortChecked == true) {
          this.briefingShortChecked = true;
        }
        return true;
      } else return false;
    },

    async createRandomArray() {
      // Randomize Skala

      const storage = new Storage();
      await storage.create();
      const randomArray = [];

      const rs = await storage.get('randomArray');
      console.log('randomArray rs', rs);
      if (rs === null) {
        console.log('NEW randomArray');

        for (let i = 0; i <= 30; i++) {
          const entry = Math.floor(Math.random() * 100);
          console.log('NEW randomArray - entry', entry);

          randomArray.push(entry);
        }
        const unique = [...new Set(randomArray)];

        await storage.set('randomArray', unique);
        this.randomArray = unique;
      } else {
        console.log('Load randomArray');
        this.randomArray = await storage.get('randomArray');
      }

      console.log('randomArray:', randomArray);

      // END Randomize Skala
    },
  },
  getters: {
    getUserData: (state) => state.userData,
  },
});
