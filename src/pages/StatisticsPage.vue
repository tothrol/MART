<template>
  <base-layout>
    <div class="box">
      <!-- EventStats
       -->

      <h2 class="h2_stats">EventStats</h2>

      <GetPostsComponent
        @getPosts="getPosts"
        @setFilenameValues="setFilenameValues"
        :perPage="1"
      ></GetPostsComponent>

      <div class="buttons">
        <ion-button class="csv_download"
          ><a
            :href="allEventStatsCsv"
            :download="filenameEvents"
            ref="csvEventStats"
            >Download {{ filenameEvents }}
          </a></ion-button
        >
        <ion-button class="csv_download"
          ><a
            :href="allUsageStatsCsv"
            :download="filenameUsage"
            ref="csvUsageStats"
            >Download {{ filenameUsage }}</a
          ></ion-button
        >
      </div>

      <div class="answers_count">
        <div>
          Anzahl Events in csv:
          {{ Object.entries(allEventStatsUnique).length }}
        </div>
        <div v-if="getAll">
          Total Pages (if using get all Posts option):
          {{ evaluationStore.totalPages.statistics }}
        </div>
        <div>
          Total Posts (in WP): {{ evaluationStore.totalPosts.statistics }}
        </div>
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
        </div>
        <div
          class="row"
          v-for="(value, property) of allEventStatsUnique.slice(0, 1000)"
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

      <!-- Usage Stats -->

      <div>
        <h2>UsageStats</h2>

        <div class="answers_count">
          <div>
            Anzahl Stats: {{ Object.entries(allUsageStatsUnique).length }}
          </div>
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
          </div>
          <div
            class="row"
            v-for="(value, property) of allUsageStatsUnique.slice(0, 1000)"
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
      </div>

      <Transition>
        <MessageboxComponent v-if="false" @click="showMessage = false"
          >Here is a message</MessageboxComponent
        >
      </Transition>
    </div>
  </base-layout>
</template>

<script setup>
  import { reactive, computed, watch } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useEvaluationStore } from '@/stores/evaluationStore';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import GetPostsComponent from '../components/GetPostsComponent.vue';
  import { useUserStore } from '@/stores/userStore';
  import dayjs from 'dayjs';

  const userStore = useUserStore();

  const csvUsageStats = ref(null);
  const csvEventStats = ref(null);

  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    //
  });

  let getAll = ref(false);
  async function getPosts(getAllValue, perPage, page, offset, useOffset) {
    getAll.value = getAllValue;

    let result = await evaluationStore.getStatistics(
      getAllValue,
      perPage,
      page,
      offset,
      useOffset,
      'nutzungsstatistik'
    );

    if (result.status != 200) {
      let appMessage = `Es gab einen Fehler bei der Serveranfrage: ${result.response.data.code}, ${result.response.data.message}`;
      userStore.appMessage = appMessage;
      userStore.showAppMessage = true;
    }
  }

  // END Update 14.08

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
        // single event

        let string = wpPost.acf.queryUsageStats;

        let string2 = string.substring(1, string.length - 1);
        let array = string2.split('},{');

        for (let i = 0; i < array.length; i++) {
          let singleStatObject;
          let singleStatString = array[i];

          let singleStatStringObject = '{' + singleStatString + '}';

          singleStatObject = JSON.parse(singleStatStringObject);
          // console.log('Statistics - single - singleStatObj', singleStatObject);
          singleStatObject['iosscreentime'] = wpPost.acf.iosscreentime;
          singleStatObject['iosactivations'] = wpPost.acf.iosactivations;
          singleStatObject['userId'] = wpPost.acf.userIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;

          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['dateLong'] = wpPost.acf.dateLongStats;
          singleStatObject['postId'] = wpPost.id;
          singleStatObject['postTitle'] = wpPost.title.rendered;

          singleStatObject['date'] = wpPost.acf.dateStats;
          singleStatObject['time'] = wpPost.acf.timeStats;
          singleStatObject['timestamp'] = wpPost.acf.timestamp;

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
    // console.log('Compare - ');
    // if (!a.timestamp || a.timestamp === '' || a.timestamp === undefined)
    //   return -1;
    // if (a.timestamp < b.timestamp) return -1;
    // if (a.timestamp > b.timestamp) return 1;

    if (a.timestamp < b.timestamp) return 1;
    if (a.timestamp > b.timestamp) return -1;
    // console.log('compare: ', a.timestamp, b.timestamp);
    if (!b.timestamp || b.timestamp === '' || b.timestamp === undefined)
      return -1;
    // if (a.uniqueUserId < b.uniqueUserId) return -1;
    // if (a.uniqueUserId > b.uniqueUserId) return 1;

    // if (a.getPackageName < b.getPackageName) return -1;
    // if (a.getPackageName > b.getPackageName) return 1;
    // if (a.getFirstTimeStamp < b.getFirstTimeStamp) return -1;
    // if (a.getFirstTimeStamp > b.getFirstTimeStamp) return 1;

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
    'timestamp',

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
    'iosscreentime',
    'iosactivations',
  ];

  function mapFunction(element, index, array) {
    let newArray = [];
    usageStatsElements.forEach(function (element2) {
      newArray.push(element[element2]);
    });
    return newArray;
  }

  let allUsageStatsUnique = computed(() => {
    let allUsage = allUsageStats.value;

    // START Unique
    // let unique = [];
    // unique = allUsage.filter(filterFunction);
    // END Unique

    // let sorted = unique.sort(compare);

    return allUsage;
  });

  let allUsageStatsCsv = computed(() => {
    let csvString = [
      usageStatsElements,
      ...allUsageStatsUnique.value.map(mapFunction),
    ]
      .map((e) => e.join(';'))
      .join('\n');

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);

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
    'timestamp',

    'cn',
    'et',
    'pn',
    'ts',
  ];

  let allEventStats = computed(() => {
    let allEventStats = [];
    let wpPosts = evaluationStore.statistics;

    if (wpPosts != null && wpPosts != undefined) {
      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        // single WP Post
        let queryEventStats = {};
        let string = wpPost.acf.queryEventStats;
        // removing first and last character
        let string2 = string.substring(1, string.length - 1);

        // array: each event is an array entry
        let array = string2.split('},{');

        for (let i = 0; i < array.length; i++) {
          let singleStatObject;
          let singleStatString = array[i];
          let singleStatStringObject = '{' + singleStatString + '}';

          // from JSON to JS-Object e.g.:  {cd: null,pn: android, et:15, ts: 126543554}
          singleStatObject = JSON.parse(singleStatStringObject);

          singleStatObject['userId'] = wpPost.acf.userIdStats;
          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;

          singleStatObject['userName'] = wpPost.acf.userNameStats;
          singleStatObject['dateLong'] = wpPost.acf.dateLongStats;
          singleStatObject['postId'] = wpPost.id;
          singleStatObject['postTitle'] = wpPost.title.rendered;

          singleStatObject['date'] = wpPost.acf.dateStats;
          singleStatObject['time'] = wpPost.acf.timeStats;
          singleStatObject['timestamp'] = wpPost.acf.timestamp;

          allEventStats.push(singleStatObject);
        }
      }

      return allEventStats;
    } else {
      return null;
    }
  });

  function filterFunctionEvent(element, index, array) {
    // Filters double entrys (with same user, package and date) so that only the newest entry for a day will be kept
    let bool = true;
    array.forEach(function (element2, index2) {
      if (
        element.uniqueUserId === element2.uniqueUserId &&
        element.cn === element2.cn &&
        element.et === element2.et &&
        element.pn === element2.pn &&
        element.ts === element2.ts
      ) {
        // console.log('Statistics - filterFunction', element, element2);
        // element is for same user, package and date
        if (element.timestamp < element2.timestamp) {
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
    let allEvents = allEventStats.value;

    // START Unique
    // let unique = [];
    // unique = allEvents.filter(filterFunctionEvent);
    // END Unique

    // const now = dayjs();
    // const t = now.valueOf();
    // console.log('Compare - t:', t);

    // let sorted = unique.sort(compare);
    // const t2 = now.valueOf();
    // console.log('Compare - t2:', t2);
    // console.log('Compare - duration:', t2 - t);

    // console.log('statistics - sorted: ', sorted);
    // console.log('statistics - unique: ', unique);

    // let arrayOrdered = allEventStats.value.forEach(function (item, index) {});

    return allEvents;
  });

  let allEventStatsCsv = computed(() => {
    let csvString = [
      eventStatsElements,
      ...allEventStatsUnique.value.map(mapFunctionEvent),
    ]
      .map((e) => e.join(';'))
      .join('\n');

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);
    // csvEventStats.value.setAttribute('href', encodeUri);
    // csvEventStats.value.setAttribute('download', 'csvEventStats.csv');

    return encodeUri;
  });

  // END Event Stats

  // Start Filename
  let filenameFirstPost = ref(0);
  let filenameLastPost = ref(0);

  let filenameEvents = ref(createFileName('EventStats'));

  let filenameUsage = ref(createFileName('UsageStats'));

  function createFileName(string) {
    let last =
      filenameFirstPost.value +
      Object.entries(evaluationStore.statistics).length -
      1;
    if (!getAll.value) {
      return `${string}-${filenameFirstPost.value}-${last}.csv`;
    } else {
      return `${string}-all.csv`;
    }
  }

  function setFilenameValues(firstPost, lastPost) {
    console.log('setFilenameValues: ', firstPost, lastPost);
    filenameFirstPost.value = firstPost;
    filenameLastPost.value = lastPost;
  }

  watch(allUsageStatsCsv, () => {
    filenameUsage.value = createFileName('UsageStats');
  });

  watch(allEventStatsCsv, () => {
    filenameEvents.value = createFileName('EventStats');
  });

  // END Filename
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
    margin-top: 20px;
    /* font-size: 20px; */
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

  .firstLast {
    margin-top: 10px;
  }
</style>
