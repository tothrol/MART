<template>
  <base-layout>
    <div class="box">
      <h2>UsageStats</h2>
      <div class="buttons">
        <ion-button @click="evaluationStore.getStatistics()" color="medium"
          >Aktualisieren</ion-button
        ><ion-button class="csv_download"
          ><a
            :href="allUsageStatsCsv"
            download="csvUsageStats.csv"
            ref="csvUsageStats"
            >Download CSV usageStats</a
          ></ion-button
        >
      </div>

      <div class="answers_count">
        Anzahl Stats: {{ Object.entries(allUsageStatsUnique).length }}
      </div>
      <div class="answers" v-if="allUsageStatsUnique != undefined">
        <div
          class="row heading"
          v-if="Object.entries(allUsageStatsUnique).length >= 1"
        >
          <div
            class="long cell"
            v-for="element of usageStatsElements"
            :key="element"
          >
            {{ element }}
          </div>

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
          v-for="(value, property) of allUsageStatsUnique"
          :key="property"
        >
          <div
            class="long cell"
            v-for="element of usageStatsElements"
            :key="element"
          >
            {{ value[element] }}
          </div>
        </div>
      </div>

      <!-- EventStats
       -->
      <h2>EventStats</h2>

      <div class="buttons">
        <ion-button @click="evaluationStore.getStatistics()" color="medium"
          >Aktualisieren</ion-button
        ><ion-button class="csv_download"
          ><a
            :href="allEventStatsCsv"
            download="csvEventStats.csv"
            ref="csvEventStats"
            >Download CSV eventStats</a
          ></ion-button
        >
      </div>

      <div class="answers_count">
        Anzahl Stats: {{ Object.entries(allEventStatsUnique).length }}
      </div>
      <div class="answers" v-if="allEventStats != undefined">
        <div
          class="row heading"
          v-if="Object.entries(allEventStats).length >= 1"
        >
          <div
            class="long cell"
            v-for="element of eventStatsElements"
            :key="element"
          >
            {{ element }}
          </div>

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
          v-for="(value, property) of allEventStatsUnique"
          :key="property"
        >
          <div
            class="long cell"
            v-for="element of eventStatsElements"
            :key="element"
          >
            {{ value[element] }}
          </div>
        </div>
      </div>
      <!-- End EvntStats -->
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

  const csvUsageStats = ref(null);
  const csvEventStats = ref(null);

  const userStore = useUserStore();

  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    evaluationStore.getStatistics();
  });

  let showMessage = ref(true);

  // let headerRow = computed(() => {
  //   let header = {};

  //   let wpPosts = evaluationStore.statistics;
  //   console.log('Statistics - headerRow - wpPosts', wpPosts);

  //   if (wpPosts != null && wpPosts != undefined) {
  //     console.log('Statistics - headerRow - wpPosts[0] - ', wpPosts[0]);
  //     for (let [key, value] of Object.entries(wpPosts)) {
  //       console.log('Statistics - headerRow - wpPosts - LOOP ', key, value);
  //       header = value.acf;
  //       return header;
  //     }
  //   }

  //   return null;
  // });

  // let firstEntry = ref()

  let allUsageStats = computed(() => {
    let allUsageStats = [];
    let wpPosts = evaluationStore.statistics;

    if (wpPosts != null && wpPosts != undefined) {
      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        let queryEventStats = {};

        // single event

        let string = wpPost.acf.queryUsageStats;
        let string2 = string.substring(1, string.length - 1);
        let array = string2.split('},{');

        for (let i = 0; i < array.length; i++) {
          let singleStatObject;
          let singleStatString = array[i];
          let singleStatStringObject = '{' + singleStatString + '}';
          // console.log(
          //   'Statistics - single - array :',
          //   array,
          //   'array.length: ',
          //   array.length,
          //   'i: ',
          //   i
          // );
          // console.log(
          //   'Statistics - single - singleStatStringObject',
          //   singleStatStringObject
          // );
          singleStatObject = JSON.parse(singleStatStringObject);
          // console.log('Statistics - single - singleStatObj', singleStatObject);
          singleStatObject['userId'] = wpPost.acf.userIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['dateLong'] = wpPost.acf.dateLongStats;
          singleStatObject['postId'] = wpPost.id;
          singleStatObject['postTitle'] = wpPost.title.rendered;

          singleStatObject['date'] = wpPost.acf.dateStats;
          singleStatObject['time'] = wpPost.acf.timeStats;

          // console.log('Statistics - singleStatObject', singleStatObject);
          allUsageStats.push(singleStatObject);
        }
        // console.log('Statistics - queryEventStats', queryEventStats);
      }

      return allUsageStats;
    } else {
      return null;
    }
  });

  function compare(a, b) {
    if (a.uniqueUserId < b.uniqueUserId) return -1;
    if (a.uniqueUserId > b.uniqueUserId) return 1;
    if (a.getPackageName < b.getPackageName) return -1;
    if (a.getPackageName > b.getPackageName) return 1;
    if (a.getFirstTimeStamp < b.getFirstTimeStamp) return -1;
    if (a.getFirstTimeStamp > b.getFirstTimeStamp) return 1;
    if (a.timeStampAndroid < b.timeStampAndroid) return 1;
    if (a.timeStampAndroid > b.timeStampAndroid) return -1;

    return 0;
  }

  function filterFunction(element, index, array) {
    // Filters double entrys (with same user, package and date) so that only the newest entry for a day will be kept
    let bool = true;
    array.forEach(function (element2, index2) {
      if (
        element.uniqueUserId === element2.uniqueUserId &&
        element.getPackageName === element2.getPackageName &&
        element.getFirstTimeStamp === element2.getFirstTimeStamp
      ) {
        // console.log('Statistics - filterFunction', element, element2);
        // element is for same user, package and date
        if (element.timeStampAndroid < element2.timeStampAndroid) {
          // only the newest enty will be kept
          // console.log(
          //   'Statistics - filterFunction - timeStampAndroid',
          //   element,
          //   element2
          // );
          bool = false;
          return false;
        } else {
          // console.log('Statistics - filterFunction -true');
          return true;
        }
      } else {
        // console.log('Statistics - filterFunction -true');
        return true;
      }
    });
    return bool;
  }

  let usageStatsElements = [
    'userId',
    'userName',
    'uniqueUserId',
    'postId',
    'postTitle',
    'date',
    'dateLong',
    'time',
    'timeStampAndroid',
    'getPackageName',

    'getTotalTimeForegroundServiceUsedInSec',
    'getTotalTimeInForegroundInSec',
    'getTotalTimeVisibleInSec',

    'getFirstTimeStamp',
    'getFirstTimeStampDate',

    'getLastTimeStamp',
    'getLastTimeStampDate',

    'getLastTimeUsed',
    'getLastTimeUsedDate',

    'getLastTimeVisible',
    'getLastTimeVisibleDate',

    'getLastTimeForegroundServiceUsed',
    'getLastTimeForegroundServiceUsedDate',
  ];

  function mapFunction(element, index, array) {
    let newArray = [];
    usageStatsElements.forEach(function (element2) {
      newArray.push(element[element2]);
    });
    return newArray;
  }

  let allUsageStatsUnique = computed(() => {
    let arrayUnique = [];

    let allUsage = allUsageStats.value;
    let sorted = allUsage.sort(compare);

    let unique = [];
    unique = sorted.filter(filterFunction);
    // console.log('statistics - sorted: ', sorted);
    // console.log('statistics - unique: ', unique);

    // let arrayOrdered = allUsageStats.value.forEach(function (item, index) {});

    return unique;
  });

  let allUsageStatsCsv = computed(() => {
    let csvString = [
      usageStatsElements,
      ...allUsageStatsUnique.value.map(mapFunction),
    ]
      .map((e) => e.join(','))
      .join('\n');

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);
    // csvUsageStats.value.setAttribute('href', encodeUri);
    // csvUsageStats.value.setAttribute('download', 'csvUsageStats.csv');

    return encodeUri;
  });

  // Event Stats

  let eventStatsElements = [
    'userId',
    'userName',
    'uniqueUserId',
    'postId',
    'postTitle',
    'date',
    'dateLong',
    'time',
    'timeStampAndroid',
    'getEventType',
    'getTotalTimeInSec',
    'describeContents',
    'getCount',
    'getFirstTimeStamp',
    'getFirstTimeStampDate',
    'getLastTimeStamp',
    'getLastTimeStampDate',
    'getLastEventTime',
    'getLastEventTimeDate',
  ];

  let allEventStats = computed(() => {
    let allEventStats = [];
    let wpPosts = evaluationStore.statistics;

    if (wpPosts != null && wpPosts != undefined) {
      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        let queryEventStats = {};

        // single event

        let string = wpPost.acf.queryEventStats;
        let string2 = string.substring(1, string.length - 1);
        let array = string2.split('},{');

        for (let i = 0; i < array.length; i++) {
          let singleStatObject;
          let singleStatString = array[i];
          let singleStatStringObject = '{' + singleStatString + '}';
          // console.log(
          //   'Statistics - single - array :',
          //   array,
          //   'array.length: ',
          //   array.length,
          //   'i: ',
          //   i
          // );
          // console.log(
          //   'Statistics - single - singleStatStringObject',
          //   singleStatStringObject
          // );
          singleStatObject = JSON.parse(singleStatStringObject);
          // console.log('Statistics - single - singleStatObj', singleStatObject);
          singleStatObject['userId'] = wpPost.acf.userIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['dateLong'] = wpPost.acf.dateLongStats;
          singleStatObject['postId'] = wpPost.id;
          singleStatObject['postTitle'] = wpPost.title.rendered;

          singleStatObject['date'] = wpPost.acf.dateStats;
          singleStatObject['time'] = wpPost.acf.timeStats;

          // console.log('Statistics - singleStatObject', singleStatObject);
          allEventStats.push(singleStatObject);
        }
        // console.log('Statistics - queryEventStats', queryEventStats);
      }

      return allEventStats;
    } else {
      return null;
    }
  });

  function compareEvent(a, b) {
    if (a.uniqueUserId < b.uniqueUserId) return -1;
    if (a.uniqueUserId > b.uniqueUserId) return 1;
    if (a.getEventType < b.getEventType) return -1;
    if (a.getEventType > b.getEventType) return 1;
    if (a.getFirstTimeStamp < b.getFirstTimeStamp) return -1;
    if (a.getFirstTimeStamp > b.getFirstTimeStamp) return 1;
    if (a.timeStampAndroid < b.timeStampAndroid) return 1;
    if (a.timeStampAndroid > b.timeStampAndroid) return -1;

    return 0;
  }

  function filterFunctionEvent(element, index, array) {
    // Filters double entrys (with same user, package and date) so that only the newest entry for a day will be kept
    let bool = true;
    array.forEach(function (element2, index2) {
      if (
        element.uniqueUserId === element2.uniqueUserId &&
        element.getEventType === element2.getEventType &&
        element.getFirstTimeStamp === element2.getFirstTimeStamp
      ) {
        // console.log('Statistics - filterFunction', element, element2);
        // element is for same user, package and date
        if (element.timeStampAndroid < element2.timeStampAndroid) {
          // only the newest enty will be kept
          // console.log(
          //   'Statistics - filterFunction - timeStampAndroid',
          //   element,
          //   element2
          // );
          bool = false;
          return false;
        } else {
          // console.log('Statistics - filterFunction -true');
          return true;
        }
      } else {
        // console.log('Statistics - filterFunction -true');
        return true;
      }
    });
    return bool;
  }

  function mapFunctionEvent(element, index, array) {
    let newArray = [];
    eventStatsElements.forEach(function (element2) {
      newArray.push(element[element2]);
    });
    return newArray;
  }

  let allEventStatsUnique = computed(() => {
    let arrayUnique = [];

    let allEvents = allEventStats.value;
    let sorted = allEvents.sort(compareEvent);

    let unique = [];
    unique = sorted.filter(filterFunctionEvent);
    // console.log('statistics - sorted: ', sorted);
    // console.log('statistics - unique: ', unique);

    // let arrayOrdered = allEventStats.value.forEach(function (item, index) {});

    return sorted;
  });

  let allEventStatsCsv = computed(() => {
    let csvString = [
      eventStatsElements,
      ...allEventStatsUnique.value.map(mapFunctionEvent),
    ]
      .map((e) => e.join(','))
      .join('\n');

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);
    // csvEventStats.value.setAttribute('href', encodeUri);
    // csvEventStats.value.setAttribute('download', 'csvEventStats.csv');

    return encodeUri;
  });

  // END Event Stats
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

  .cell.long {
    min-width: 200px !important;
    max-width: 200px !important;
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

  .csv_download a {
    color: white;
  }
</style>
