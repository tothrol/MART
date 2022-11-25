import { defineStore } from 'pinia';
import { validValue } from '../composables/ValidValue';
import axios from 'axios';
import { Storage } from '@ionic/storage';
import { useQuestionsStore } from '@/stores/questionsStore';
import { useInfoStore } from '@/stores/infoStore';
import dayjs from 'dayjs';

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

      // showQuestions: false,
      showDevbox: true,
      uniqueUserId: '',
      randomArray: [],
      complianceAccepted: false,
      briefingShortChecked: false,
    };
  },
  actions: {
    updateUserData(data) {
      // console.log('store - updateUserData - data', data);

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

      // console.log(
      //   'store - updateUserData - this.userData, uniqueUserId',
      //   this.userData,
      //   this.uniqueUserId
      // );
    },
    async logout() {
      this.userData.token = '';

      const storage = new Storage();
      await storage.create();
      await storage.remove('token');
      // await storage.remove('email');
      // await storage.remove('username');
      // await storage.remove('id');

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
        if (response.status === 200) {
          this.userData.token = response.data.token;
          this.userData.email = response.data.user_email;
          this.userData.username = response.data.user_display_name;
          this.userData.id = response.data.user_id;
          const storage = new Storage();
          await storage.create();
          await storage.set('token', response.data.token);
          await storage.set('email', response.data.user_email);
          await storage.set('username', response.data.user_display_name);
          await storage.set('id', response.data.user_id);

          if (this.uniqueUserId != uniqueUserId) {
            console.log('NewUniqueUserID');
            const storage = new Storage();
            await storage.create();
            await storage.set('uniqueUserId', uniqueUserId);
            this.uniqueUserId = uniqueUserId;

            await storage.remove('randomArray');
            await storage.remove('complianceAccepted');
            await storage.remove('briefingShortChecked');
            await storage.remove('lastShortAnswer');
            await storage.remove('todayShortAnswers');
            await storage.remove('totalShortAnswers');
            await storage.remove('initialAnswerExist');
            this.createRandomArray();
            this.complianceAccepted = false;
            this.briefingShortChecked = false;
            let questionsStore = useQuestionsStore();
            questionsStore.lastShortAnswer = '';
            questionsStore.todayShortAnswers = 0;
            questionsStore.totalShortAnswers = 0;
            questionsStore.initialAnswerExist = false;

            questionsStore.getLastShortAnswer();
            questionsStore.countShortAnswers();
            questionsStore.checkIfInitalAnswerExists();
          }
        }
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
      // Runs at restart of page / restart of App
      console.log('checkAuth');
      // At Start/Restart of App
      // wird getriggert wenn auf /login zugegriggen wird

      // wird bei jedem refresh/restart ausgeführt:
      const storage = new Storage();
      await storage.create();
      let briefingShortChecked = await storage.get('briefingShortChecked');
      if (briefingShortChecked == true) {
        this.briefingShortChecked = true;
      }
      const complianceAccepted = await storage.get('complianceAccepted');
      // console.log('CheckAuth - complianceAccepted', complianceAccepted);
      if (complianceAccepted == true) {
        this.complianceAccepted = true;
      }
      const questionsStore = useQuestionsStore();

      let todayShortAnswers = await storage.get('todayShortAnswers');
      if (todayShortAnswers != null) {
        questionsStore.todayShortAnswers = todayShortAnswers;
      }

      let totalShortAnswers = await storage.get('totalShortAnswers');
      if (totalShortAnswers != null) {
        questionsStore.totalShortAnswers = totalShortAnswers;
      }
      let lastShortAnswer = await storage.get('lastShortAnswer');
      if (lastShortAnswer != null) {
        questionsStore.lastShortAnswer = lastShortAnswer;
        // check if lastShortAnswer is from today to reset todayShortAnswers

        const today = dayjs().format('DD.MM.YY');
        const dateOfLastShortAnswer = dayjs(lastShortAnswer).format('DD.MM.YY');
        if (today != dateOfLastShortAnswer) {
          questionsStore.todayShortAnswers = 0;
          await storage.set('todayShortAnswers', 0);
        }
      }

      let randomArray = await storage.get('randomArray');
      if (randomArray != null) {
        this.randomArray = randomArray;
      } else {
        this.createRandomArray();
      }

      let initialAnswerExist = await storage.get('initialAnswerExist');
      console.log('userStore - Auth - initialAnswerExist', initialAnswerExist);
      if (initialAnswerExist != null) {
        questionsStore.initialAnswerExist = initialAnswerExist;
      } else {
        questionsStore.checkIfInitalAnswerExists();
      }

      const id = await storage.get('id');
      const email = await storage.get('email');
      const username = await storage.get('username');
      const uniqueUserId = await storage.get('uniqueUserId');
      const userData = {
        id: id,
        email: email,
        username: username,
        token: '',
        uniqueUserId: uniqueUserId,
      };
      this.updateUserData(userData);
      // END wird bei jedem refresh/restart ausgeführt

      const token = await storage.get('token');
      if (token != null) {
        // Wird nur ausgeführt wenn ein Token vorhanden ist
        this.userData.token = token;

        return true;
      } else return false;
    },

    async createRandomArray() {
      // Randomize Skala

      const storage = new Storage();
      await storage.create();
      const randomArray = [];

      // console.log('randomArray rs', rs);

      // console.log('NEW randomArray');

      for (let i = 0; i <= 30; i++) {
        const entry = Math.floor(Math.random() * 100);
        // console.log('NEW randomArray - entry', entry);

        randomArray.push(entry);
      }
      const unique = [...new Set(randomArray)];

      await storage.set('randomArray', unique);
      this.randomArray = unique;

      console.log('randomArray:', randomArray);

      // END Randomize Skala
    },
  },
  getters: {
    getUserData: (state) => state.userData,
  },
});
