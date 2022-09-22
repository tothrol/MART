<template>
  <div>
    <h2>Antworten</h2>
    <div class="answers_count">
      Anzahl Antworten: {{ Object.entries(allAnswers).length }}
    </div>
    <div class="answers">
      <div class="row heading" v-if="Object.entries(allAnswers).length >= 1">
        <div class="userName cell">userName</div>
        <div class="userId cell">userId</div>
        <div class="uniqueUserId cell">uniqueUserId</div>
        <div class="postId cell">postId</div>
        <div class="date cell">Datum</div>
        <div class="time cell">Zeit</div>
        <div class="cell answer" v-for="(count, key) of questions" :key="key">
          {{ key }}
        </div>
      </div>
      <div class="row" v-for="(answerSheet, key) of allAnswers" :key="key">
        <div class="userName cell">{{ answerSheet.userName }}</div>
        <div class="userId cell">{{ answerSheet.userId }}</div>
        <div class="uniqueUserId cell">{{ answerSheet.uniqueUserId }}</div>
        <div class="postId cell">{{ answerSheet.postId }}</div>
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
    <h2>Fragenschlüssel</h2>
    <div class="questions">
      <div class="row heading">
        <div class="itemId cell">ItemId</div>
        <div class="scaleId cell">ScaleId</div>
        <div class="question cell">Frage</div>
      </div>
      <div class="row" v-for="(question, key) of props.questions" :key="key">
        <div class="itemId cell">{{ question.itemId }}</div>
        <div class="scaleId cell">{{ question.scaleId }}</div>
        <div class="question cell">{{ question.item }}</div>
      </div>
    </div>

    <!-- <h2>Skalaschlüssel</h2>
    <div class="scales">
      <div class="row heading">
        <div class="scaleId cell">ScaleId</div>
        <div class="scaleRepeater cell">Auswahl</div>
      </div>
      <div class="row" v-for="(scale, key) of props.scales" :key="key">
        <div class="scaleId cell">{{ scale.scaleId }}</div>
        <div
          class="scaleRepeater cell"
          v-for="(scale, key2) of scale.scaleRepeater"
          :key="key2"
        >
          <div class="key cell">{{ scale.key }}</div>
          <div class="value cell">{{ scale.value }}</div>
        </div>
      </div>
    </div> -->

    <h2>Skalaschlüssel</h2>
    <div class="scales">
      <div class="outerRow">
        <div class="row heading">
          <div class="scaleId cell">ScaleId</div>
          <div class="key cell">key</div>
          <div class="value cell">Value</div>
        </div>
      </div>
      <div class="outerRow" v-for="(scale, key) of props.scales" :key="key">
        <div
          class="row scaleRepeater cell"
          v-for="(scale2, key2) of scale.scaleRepeater"
          :key="key2"
        >
          <div class="scaleId cell">{{ scale.scaleId }}</div>
          <div class="key cell">{{ scale2.key }}</div>
          <div class="value cell">{{ scale2.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ref, onMounted, defineProps } from 'vue';

  const props = defineProps({
    ans: Object,
    answerType: String,
    questions: Object,
    scales: Object,
  });

  let arrayOfAnswers = [];

  let allAnswers = computed(() => {
    let allAnswers = {};
    if (props.ans != null && props.ans != undefined) {
      let wpPosts = props.ans;
      console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        console.log('Answers - answers', wpPost, key1);

        let row = {};
        let answers = {};

        if (props.answerType == 'initial') {
          answers = JSON.parse(wpPost.acf.answers);
          row = {
            date: wpPost.acf.date,
            dateLong: wpPost.acf.dateLong,
            time: wpPost.acf.time,
            userId: wpPost.acf.userId,
            postId: wpPost.id,
            userName: wpPost.acf.userName,
            uniqueUserId: wpPost.meta.uniqueUserId,
            answers: answers,
          };
        } else {
          answers = JSON.parse(wpPost.acf.answers_k);
          row = {
            date: wpPost.acf.date_k,
            dateLong: wpPost.acf.dateLong_k,
            time: wpPost.acf.time_k,
            userId: wpPost.acf.userId_k,
            postId: wpPost.id,
            userName: wpPost.acf.userName_k,
            uniqueUserId: wpPost.meta.uniqueUserId,
            answers: answers,
          };
        }

        // for (let [key2, answer] of Object.entries(answers)) {
        //   console.log('Answers - answer', answer, key2);
        //   row[key2] = JSON.parse(answer);
        // }
        allAnswers[key1] = row;
      }

      return allAnswers;
    } else {
      return null;
    }
  });

  let allAnswersOneDimentional = computed(() => {
    let allAnswers = {};
    if (props.ans != null && props.ans != undefined) {
      let wpPosts = props.ans;
      console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        console.log('Answers - answers', wpPost, key1);

        let row = {};
        let answers = {};

        if (props.answerType == 'initial') {
          answers = JSON.parse(wpPost.acf.answers);
          row = {
            date: wpPost.acf.date,
            dateLong: wpPost.acf.dateLong,
            time: wpPost.acf.time,
            userId: wpPost.acf.userId,
            userName: wpPost.acf.userName,
            ...answers,
          };
        } else {
          answers = JSON.parse(wpPost.acf.answers_k);
          row = {
            date: wpPost.acf.date_k,
            dateLong: wpPost.acf.dateLong_k,
            time: wpPost.acf.time_k,
            userId: wpPost.acf.userId_k,
            userName: wpPost.acf.userName_k,
            ...answers,
          };
        }

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
  h2 {
    margin-top: 55px;
  }
  .answers,
  .scales {
    overflow: auto;
    width: 90vw;
    min-height: 300px;
    border: 2px solid var(--ion-color-medium);
  }
  .answers {
    max-height: 700px;
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
    width: 70px;
    min-width: 70px;
  }

  .uniqueUserId {
    width: 110px;
    min-width: 110px;
  }

  .postId {
    width: 70px;
    min-width: 70px;
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

  .questions {
  }

  .questions .itemId {
    width: 60px;
    min-width: 60px;
  }

  .questions .scaleId {
    width: 70px;
    min-width: 70px;
  }

  .questions .question {
    width: 100%;
    min-width: 60px;
  }

  .scales .scaleRepeater {
    /* max-width: 200px;
    min-width: 150px;
    width: 100%; */
    width: max-content;
  }

  .scales .cell {
    width: max-content;
  }

  .outerRow {
    margin-bottom: 15px;

    width: fit-content;
  }

  .scales {
    border: none;
  }

  .scales .scaleId {
    width: 70px;
    min-width: 70px;
  }

  .scales .value {
  }

  .scales .key {
  }

  .scales .key {
    width: 220px;
  }

  .scales .value {
    width: 60px;
  }
</style>
