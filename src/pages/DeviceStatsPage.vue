<template>
  <base-layout>
    <div class="box">
      <!-- Device Stats -->

      <h2 class="h2_stats">DeviceStats</h2>
      <GetPostsComponent
        @getPosts="getPosts"
        @setFilenameValues="setFilenameValues"
      ></GetPostsComponent>

      <div class="buttons">
        <ion-button class="csv_download"
          ><a
            :href="allDeviceInfosCsv"
            :download="filename"
            ref="csvDeviceInfos"
            >Download {{ filename }}</a
          ></ion-button
        >
      </div>
      <div class="answers_count">
        <div v-if="getAll">
          Total Pages (if using get all Posts option):
          {{ evaluationStore.totalPages.deviceInfos }}
        </div>
        <div>
          Total Posts (in WP): {{ evaluationStore.totalPosts.deviceInfos }}
        </div>
      </div>

      <div class="answers_count">
        Anzahl Device Stats in csv: {{ Object.entries(allDeviceInfos).length }}
      </div>
      <div class="answers" v-if="allDeviceInfos != undefined">
        <div
          class="row heading"
          v-if="Object.entries(allDeviceInfos).length >= 1"
        >
          <div
            class="long cell"
            v-for="element of deviceInfosElements"
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
          v-for="(value, property) of allDeviceInfos.slice(0, 1000)"
          :key="property"
        >
          <div
            class="long cell"
            v-for="element of deviceInfosElements"
            :key="element"
          >
            {{ value[element] }}
          </div>
        </div>
      </div>
      <transition>
        <messagebox-component
          type="normal"
          name="fade"
          v-if="userStore.appMessage != '' && userStore.showAppMessage"
          ><p
            v-html="userStore.appMessage"
            style="white-space: pre-line"
          ></p></messagebox-component
      ></transition>
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, reactive, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';

  import { useEvaluationStore } from '@/stores/evaluationStore';
  import AnswersComponent from '@/components/AnswersComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import { IonTitle } from '@ionic/vue';
  import GetPostsComponent from '../components/GetPostsComponent.vue';

  const csvDeviceInfos = ref(null);

  const userStore = useUserStore();

  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    // evaluationStore.getDeviceInfos();
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
      'device-infos'
    );

    console.log('DeviceStats - result', result);
    if (result.status != 200) {
      let appMessage = `Es gab einen Fehler bei der Serveranfrage: ${result.response.data.code}, ${result.response.data.message}`;
      userStore.appMessage = appMessage;
      userStore.showAppMessage = true;
    } else {
      //
    }
  }

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

  // START Device Stats
  let allDeviceInfos = computed(() => {
    let allDeviceInfos = [];
    let wpPosts = evaluationStore.deviceInfos;

    if (wpPosts != null && wpPosts != undefined) {
      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        // S putting deviceInfo into stats
        let deviceInfo = {
          model: '',
          operatingSystem: '',
          osVersion: '',
          platform: '',
          manufacturer: '',
        };
        let singleStatObject;
        if (wpPost.acf.deviceInfoStats != undefined) {
          deviceInfo = JSON.parse(wpPost.acf.deviceInfoStats);
          singleStatObject = deviceInfo;

          // console.log('StatisticsPage - deviceInfo: ', deviceInfo);
        }

        // console.log(
        //   'Statistics - single - array :',
        //   array,
        //   'array.length: ',
        //   array.length,
        //   'i: ',
        //   i
        // );

        // console.log('Statistics - single - singleStatObj', singleStatObject);

        singleStatObject['userId'] = wpPost.acf.userIdStats;
        singleStatObject['userName'] = wpPost.acf.userNameStats;
        singleStatObject['uniqueUserId'] = wpPost.acf.uniqueUserIdStats;

        singleStatObject['deviceModel'] = deviceInfo.model;
        singleStatObject['deviceOs'] = deviceInfo.operatingSystem;
        singleStatObject['deviceOsVersion'] = deviceInfo.osVersion;
        singleStatObject['devicePlatform'] = deviceInfo.platform;
        singleStatObject['deviceManufacturer'] = deviceInfo.manufacturer;

        singleStatObject['dateLong'] = wpPost.acf.dateLongStats;
        singleStatObject['postId'] = wpPost.id;
        singleStatObject['postTitle'] = wpPost.title.rendered;

        singleStatObject['date'] = wpPost.acf.dateStats;
        singleStatObject['time'] = wpPost.acf.timeStats;
        singleStatObject['timestamp'] = wpPost.acf.timestamp;

        // console.log('Statistics - singleStatObject', singleStatObject);
        allDeviceInfos.push(singleStatObject);

        // console.log('Statistics - queryEventStats', queryEventStats);
      }

      allDeviceInfos.sort(compare);

      return allDeviceInfos;
    } else {
      return null;
    }
  });

  function sortDeviceInfo(a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;

    return 0;
  }

  let deviceInfosElements = [
    'userId',
    'userName',
    'uniqueUserId',

    'deviceModel',
    'deviceOs',
    'deviceOsVersion',
    'devicePlatform',
    'deviceManufacturer',

    'dateLong',
    'postId',
    'postTitle',

    'date',
    'time',
    'timestamp',
  ];

  let allDeviceInfosCsv = computed(() => {
    let csvString = [
      deviceInfosElements,
      ...allDeviceInfos.value.map(mapFunction),
    ]
      .map((e) => e.join(';'))
      .join('\n');
    console.log('csv device:', csvString);

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);
    // csvUsageStats.value.setAttribute('href', encodeUri);
    // csvUsageStats.value.setAttribute('download', 'csvUsageStats.csv');

    return encodeUri;
  });

  function mapFunction(element, index, array) {
    let newArray = [];
    deviceInfosElements.forEach(function (element2) {
      newArray.push(element[element2]);
      // console.log('device - element[element2]', element[element2], element2);
    });
    // console.log('device - newArray', newArray);
    return newArray;
  }

  // END Device Stats

  function compare(a, b) {
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

  // START Filename
  let filenameFirstPost = ref(0);
  let filenameLastPost = ref(0);
  let filename = ref(createFileName('DeviceInfos'));

  function setFilenameValues(firstPost, lastPost) {
    filenameFirstPost.value = firstPost;
    filenameLastPost.value = lastPost;
  }

  watch(allDeviceInfos, () => {
    filename.value = createFileName('DeviceInfos');
  });

  function createFileName(string) {
    let last = filenameFirstPost.value + allDeviceInfos.value.length - 1;
    if (!getAll.value) {
      return `${string}-${filenameFirstPost.value}-${last}.csv`;
    } else {
      return `${string}-all.csv`;
    }
  }

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
</style>
