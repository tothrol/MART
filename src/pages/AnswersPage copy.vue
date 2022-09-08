<template>
  <base-layout
    ><div class="box">
      <!-- <div v-for="(answer, key) of answersInitial" :key="key">
        <div>{{ answer.acf }}</div>
      </div> -->
      <div class="answers_count">
        Anzahl Antworten: {{ Object.entries(allAnswers).length }}
      </div>
      <div class="answers">
        <div class="row heading" v-if="allAnswers[0] != undefined">
          <div class="userName cell">userName</div>
          <div class="userId cell">userId</div>
          <div class="date cell">Datum</div>
          <div class="time cell">Zeit</div>
          <div
            class="cell answer"
            v-for="(count, key) of allAnswers[0].answers"
            :key="key"
          >
            {{ key }}
          </div>
        </div>
        <div class="row" v-for="(answerSheet, key) of allAnswers" :key="key">
          <div class="userName cell">{{ answerSheet.userName }}</div>
          <div class="userId cell">{{ answerSheet.userId }}</div>
          <div class="date cell">{{ answerSheet.date }}</div>
          <div class="time cell">{{ answerSheet.time }}</div>
          <div
            class="cell answer"
            v-for="(answer, key) of answerSheet.answers"
            :key="key"
          >
            {{ answer }}
          </div>
        </div>
      </div>

      <!-- <div>{{ allAnswers }}</div> -->
      <!-- <div>{{ answersInitial }}</div>
      <div>{{ evaluationStore.answersInitial }}</div> -->
    </div>
    <Transition>
      <MessageboxComponent v-if="false" @click="showMessage = false"
        >Here is a message</MessageboxComponent
      >
    </Transition>
    <div class="devbox" v-if="userStore.showDevbox">
      <ion-button
        color="medium"
        @click="userStore.showInitial = !userStore.showInitial"
        >Toggel showInitial</ion-button
      >{{ userStore.showInitial }}

      <ion-button
        color="medium"
        @click="questionsStore.checkIfInitalAnswerExists"
        >checkIfInitalAnswersExists</ion-button
      >{{ userStore.showInitial }}
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import { useEvaluationStore } from '@/stores/evaluationStore';
  import messageBoxComponent from '@/components/MessageboxComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const evaluationStore = useEvaluationStore();

  onMounted(() => {
    evaluationStore.getInitialAnswers();
  });

  let showMessage = ref(true);

  const answersInitial = evaluationStore.answersInitial;

  let allAnswers = computed(() => {
    let allAnswers = {};
    if (answersInitial != null && answersInitial != undefined) {
      let wpPosts = answersInitial;
      console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        console.log('Answers - answers', wpPost, key1);

        let answers = JSON.parse(wpPost.acf.answers);
        let row = {
          date: wpPost.acf.date,
          dateLong: wpPost.acf.dateLong,
          time: wpPost.acf.time,
          userId: wpPost.acf.userId,
          userName: wpPost.acf.userName,
          answers: answers,
        };

        // for (let [key2, answer] of Object.entries(answers)) {
        //   console.log('Answers - answer', answer, key2);
        //   row[key2] = JSON.parse(answer);
        // }
        allAnswers[key1] = row;
      }

      return allAnswers;
    } else {
      return [];
    }
  });

  let allAnswersOneDimentional = computed(() => {
    let allAnswers = {};
    if (answersInitial != null && answersInitial != undefined) {
      let wpPosts = answersInitial;
      console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        console.log('Answers - answers', wpPost, key1);

        let answers = JSON.parse(wpPost.acf.answers);
        let row = {
          date: wpPost.acf.date,
          dateLong: '',
          time: '',
          userId: '',
          userName: '',
          ...answers,
        };

        // for (let [key2, answer] of Object.entries(answers)) {
        //   console.log('Answers - answer', answer, key2);
        //   row[key2] = JSON.parse(answer);
        // }
        allAnswers[key1] = row;
      }

      return allAnswers;
    } else {
      return [];
    }
  });
</script>

<style scoped>
  .answers {
    overflow: auto;
    width: 90vw;
    min-height: 300px;
    border: 2px solid var(--ion-color-medium);
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .row .cell {
    padding: 5px 5px;
    border: 1px solid var(--ion-color-medium);
  }

  .userName {
    width: 90px;
    min-width: 90px;
  }
  .userId {
    width: 90px;
    min-width: 90px;
  }

  .date {
    width: 100px;
    min-width: 100px;
  }

  .time {
    width: 100px;
    min-width: 100px;
  }

  .answer {
    width: 45px;
    min-width: 45px;
  }

  .heading .cell {
    font-weight: 500;
    border-bottom: 4px solid black !important;
  }

  #main {
    max-width: 1000px !important;
  }

  .answers_count {
    margin-bottom: 20px;
    font-size: 20px;
  }
</style>
