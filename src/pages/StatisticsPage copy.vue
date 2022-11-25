<template>
  <base-layout>
    <div class="box">
      <div class="buttons">
        <ion-button @click="evaluationStore.getStatistics()" color="medium"
          >Aktualisieren</ion-button
        >
      </div>

      <h2>Antworten</h2>
      <div class="answers_count">
        Anzahl Antworten: {{ Object.entries(allAnswers).length }}
      </div>
      <div class="answers" v-if="allAnswers != undefined">
        <div class="row heading" v-if="Object.entries(allAnswers).length >= 1">
          <div class="userName cell">userName</div>
          <div class="userId cell">userId</div>
          <div class="uniqueUserId cell">uniqueUserId</div>
          <div class="postId cell">postId</div>
          <div class="date cell">Datum</div>
          <div class="time cell">Zeit</div>
          <div class="packageName cell">packageName</div>
          <div class="totalTimeForeground cell long">
            getTotalTimeForegroundServiceUsedInSec
          </div>
          <div class="cell long">getTotalTimeInForegroundInSec</div>
          <div class="cell long">getTotalTimeVisibleInSec</div>
          <div class="cell long">now</div>
          <div class="cell long">getFirstTimeStamp</div>
          <div class="cell long">getFirstTimeStampDate</div>
          <div class="cell long">getLastTimeForegroundServiceUsed</div>
          <div class="cell long">getLastTimeForegroundServiceUsedDate</div>
          <div class="cell long">getLastTimeStampDate</div>
          <div class="cell long">getLastTimeUsed</div>
          <div class="cell long">getLastTimeUsedDate</div>
          <div class="cell long">getLastTimeVisible</div>
          <div class="cell long">getLastTimeVisibleDate</div>

          <!-- <div
            class="cell answer"
            v-for="(value, property) of headerRow"
            :key="property"
          >
            {{ property }}
          </div> -->
        </div>
        <div
          class="row"
          v-for="(value, property) of allAnswers"
          :key="property"
        >
          <div class="userName cell">{{ value.userNameStats }}</div>
          <div class="userId cell">{{ value.userIdStats }}</div>
          <div class="uniqueUserId cell">{{ value.uniqueUserIdStats }}</div>
          <div class="postId cell">{{ value.userId }}</div>
          <div class="date cell">{{ value.acf.dateStats }}</div>
          <div class="time cell">{{ value.acf.timeStats }}</div>
          <div class="packageName cell">{{ value.acf.queryUsageStats }}</div>
          <div class="totalTimeForeground cell">totalTimeForeground</div>
          <div
            class="cell answer"
            v-for="(answer, key) of allAnswers"
            :key="key"
          >
            {{ answer }}
          </div>
        </div>
      </div>

      <Transition>
        <MessageboxComponent v-if="false" @click="showMessage = false"
          >Here is a message</MessageboxComponent
        >
      </Transition>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';

  import { useEvaluationStore } from '@/stores/evaluationStore';
  import AnswersComponent from '@/components/AnswersComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import { IonTitle } from '@ionic/vue';

  const userStore = useUserStore();

  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    evaluationStore.getStatistics();
  });

  let showMessage = ref(true);

  let headerRow = computed(() => {
    let header = {};

    let wpPosts = evaluationStore.statistics;
    console.log('Statistics - headerRow - wpPosts', wpPosts);

    if (wpPosts != null && wpPosts != undefined) {
      console.log('Statistics - headerRow - wpPosts[0] - ', wpPosts[0]);
      for (let [key, value] of Object.entries(wpPosts)) {
        console.log('Statistics - headerRow - wpPosts - LOOP ', key, value);
        header = value.acf;
        return header;
      }
    }

    return null;
  });

  // let firstEntry = ref()

  let allAnswers = computed(() => {
    let allStats = [];
    let wpPosts = evaluationStore.statistics;

    if (wpPosts != null && wpPosts != undefined) {
      console.log('Statistics - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        // firstEntry.value = wpPost
        console.log('Statistics - single', wpPost, key1);

        let row = {};
        let queryUsageStats = {};
        let queryEventStats = {};

        // single event

        let string = wpPost.acf.queryUsageStats;
        let string2 = string.substring(1, string.length - 1);
        console.log('Statistics - single - string 2', string);

        let array = string2.split('},{');
        console.log('Statistics - single - array', array);

        console.log('Statistics - single - array0', array[0]);

        let singleStatObject;

        for (let i = 0; i < array.length; i++) {
          let singleStatString = array[i];
          let singleStatStringObject = '{' + singleStatString + '}';
          console.log(
            'Statistics - single - array :',
            array,
            'array.length: ',
            array.length,
            'i: ',
            i
          );
          console.log(
            'Statistics - single - singleStatStringObject',
            singleStatStringObject
          );
          singleStatObject = JSON.parse(singleStatStringObject);
          console.log('Statistics - single - singleStatObj', singleStatObject);
          singleStatObject['userId'] = wpPost.acf.userIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['dateLong'] = wpPost.acf.dateLongStats;

          singleStatObject['date'] = wpPost.acf.dateStats;
          singleStatObject['time'] = wpPost.acf.timeStats;
        }

        allStats.push(singleStatObject);

        //  queryUsageStats[wpPost.title.rendered] = wpPost.acf.queryUsageStats;

        // end single event

        // queryUsageStats = JSON.parse(wpPost.acf.queryUsageStats);

        console.log('Statistics - singleStatObject', singleStatObject);

        // queryEventStats = JSON.parse(wpPost.acf.queryEventStats);
        console.log('Statistics - queryEventStats', queryEventStats);

        // row = {
        //   date: wpPost.acf.date,
        //   dateLong: wpPost.acf.dateLong,
        //   time: wpPost.acf.time,
        //   userId: wpPost.acf.userId,
        //   postId: wpPost.id,
        //   userName: wpPost.acf.userName,
        //   uniqueUserId: wpPost.meta.uniqueUserId,
        //   answers: answers,
        // };

        // //
        //   userIdStats: userStore.userData.id,
        // queryUsageStats: queryUsageStatsString,
        // queryEventStats: queryEventStatsString,
        // userNameStats: userStore.userData.username,
        // dateStats: today,
        // timeStats: now,
        // dateLongStats: dateLong,
        // uniqueUserIdStats: userStore.uniqueUserId,

        // //

        // for (let [key2, answer] of Object.entries(answers)) {
        //   console.log('Answers - answer', answer, key2);
        //   row[key2] = JSON.parse(answer);
        // }
      }

      return allStats;
    } else {
      return null;
    }
  });
</script>

<style scoped>
  .buttons {
    margin-right: auto;
    margin-left: auto;
    align-items: center;
    display: flex;
    flex-direction: column;
  }

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
