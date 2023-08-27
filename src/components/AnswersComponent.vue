<template>
  <div>
    <div class="button_wrapper">
      <ion-button class="csv_download"
        ><a :href="csvFile" :download="filename" ref="csvLinkRef"
          >Download {{ filename }}</a
        ></ion-button
      >
    </div>
    <div class="answers_count">
      <div v-if="getAll">
        Total Pages (if using get all Posts option):
        {{
          props.answerType === 'initial'
            ? evaluationStore.totalPages.answersInitial
            : evaluationStore.totalPages.answersShort
        }}
      </div>
      <div>
        Total Posts (in WP):
        {{
          props.answerType === 'initial'
            ? evaluationStore.totalPosts.answersInitial
            : evaluationStore.totalPosts.answersShort
        }}
      </div>
    </div>
    <div class="answers_count">
      Anzahl Antworten in csv: {{ Object.entries(allAnswers).length }}
    </div>

    <!-- <ion-button class="csv_download"
      ><a :href="shortCsv" download="shortCsv.csv" ref="shortCsvRef"
        >Download CSV Kurz</a
      ></ion-button
    > -->
    <div class="answers">
      <div class="row heading" v-if="Object.entries(allAnswers).length >= 1">
        <div
          class="cell"
          :class="headline"
          v-for="headline of headlines"
          :key="headline"
        >
          {{ headline }}
        </div>
      </div>
      <div
        class="row"
        v-for="(row, key) of allAnswersOneDimentional.slice(0, 100)"
        :key="key"
      >
        <div
          class="cell"
          :class="headline"
          v-for="(headline, key2) of headlines"
          :key="key2"
        >
          {{ row[headline] }}
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
  import { reactive, computed, watch } from 'vue';
  import { ref, onMounted, defineProps } from 'vue';
  import { useEvaluationStore } from '@/stores/evaluationStore';

  const evaluationStore = useEvaluationStore();

  const props = defineProps({
    ans: Object,
    answerType: String,
    questions: Object,
    scales: Object,
    filenameFirstPost: Number,
    filenameLastPost: Number,
    getAll: Boolean,
  });

  let arrayOfAnswers = [];

  let shortCsvRef = ref(null);
  let csvLinkRef = ref(null);

  let allAnswers = computed(() => {
    let allAnswers = {};
    if (props.ans != null && props.ans != undefined) {
      let wpPosts = props.ans;
      // console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        // console.log('Answers - answers', wpPost, key1);

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

  function compare(a, b) {
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    return -1;
  }

  let allAnswersOneDimentional = computed(() => {
    let allAnswers = [];
    if (props.ans != null && props.ans != undefined) {
      let wpPosts = props.ans;
      // console.log('Answers - wpPosts', wpPosts);

      for (let [key1, wpPost] of Object.entries(wpPosts)) {
        // console.log('Answers - answers', wpPost, key1);

        let row = {};
        let answers = {};

        if (props.answerType == 'initial') {
          answers = JSON.parse(wpPost.acf.answers);
          row = {
            date: wpPost.acf.date,
            dateLong: wpPost.acf.dateLong,
            time: wpPost.acf.time,
            timestampStart: wpPost.acf.timestampStart,
            timestamp: wpPost.acf.timestamp,
            timestampDifferenceSec: Math.round(
              (wpPost.acf.timestamp - wpPost.acf.timestampStart) / 1000
            ),
            userId: wpPost.acf.userId,
            userName: wpPost.acf.userName,
            uniqueUserId: wpPost.acf.uniqueUserId,

            postId: wpPost.id,
            postTitle: wpPost.title.rendered,
            ...answers,
          };
        } else {
          answers = JSON.parse(wpPost.acf.answers_k);
          row = {
            date: wpPost.acf.date_k,
            dateLong: wpPost.acf.dateLong_k,
            time: wpPost.acf.time_k,
            timestampStart: wpPost.acf.timestampStart_k,
            timestamp: wpPost.acf.timestamp_k,
            timestampDifferenceSec: Math.round(
              (wpPost.acf.timestamp_k - wpPost.acf.timestampStart_k) / 1000
            ),
            userId: wpPost.acf.userId_k,
            userName: wpPost.acf.userName_k,
            uniqueUserId: wpPost.acf.uniqueUserId_k,

            postId: wpPost.id,
            postTitle: wpPost.title.rendered,
            ...answers,
          };
        }

        // for (let [key2, answer] of Object.entries(answers)) {
        //   console.log('Answers - answer', answer, key2);
        //   row[key2] = JSON.parse(answer);
        // }
        allAnswers.push(row);
      }
      allAnswers.sort(compare);

      return allAnswers;
    } else {
      return [];
    }
  });

  function mapFunction(element, index, array) {
    let newArray = [];
    headlines.value.forEach(function (element2) {
      newArray.push(element[element2]);
    });
    // console.log('newArray', newArray);
    return newArray;
  }

  let headlineElements = [
    'userId',
    'userName',
    'uniqueUserId',

    'postId',
    'date',
    'dateLong',
    'time',
    'timestamp',
    'timestampStart',
    'timestampDifferenceSec',
  ];
  let answersIndex = computed(() => {
    return Object.keys(props.questions);
  });
  let headlines = computed(() => {
    return [...headlineElements, ...answersIndex.value];
  });

  let csvFile = computed(() => {
    console.log('headlines: ', headlines.value);
    let csvString = [
      headlines.value,
      ...allAnswersOneDimentional.value.map(mapFunction),
    ]
      .map((e) => e.join(';'))
      .join('\n');

    // console.log('csvString', csvString);

    let csvContent = 'data:text/csv;charset=utf-8,' + csvString;

    let encodeUri = encodeURI(csvContent);
    // csvUsageStats.value.setAttribute('href', encodeUri);
    // csvUsageStats.value.setAttribute('download', 'csvUsageStats.csv');

    return encodeUri;
  });

  // START Filename
  let filename = ref();

  if (props.answerType === 'initial') {
    filename.value = createFileName('Antworten-Initial');
  } else {
    filename.value = createFileName('Antworten-Kurz');
  }

  function createFileName(string) {
    let last =
      props.filenameFirstPost + allAnswersOneDimentional.value.length - 1;
    if (!props.getAll) {
      return `${string}-${props.filenameFirstPost}-${last}.csv`;
    } else {
      return `${string}-all.csv`;
    }
  }

  watch(allAnswersOneDimentional, () => {
    if (props.answerType === 'initial') {
      filename.value = createFileName('Antworten-Initial');
    } else {
      filename.value = createFileName('Antworten-Kurz');
    }
  });

  // END Filename
</script>

<style scoped>
  h2 {
    margin-top: 55px;
  }
  .answers,
  .scales,
  .questions {
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
    width: 40px;
    min-width: 40px;
  }

  .row .userName,
  .row .uniqueUserId,
  .row .date,
  .row .dateLong,
  .row .time,
  .row .timestamp,
  .row .timestampStart,
  .row .timestampDifferenceSec,
  .row .deviceUuid {
    width: 150px !important;
    min-width: 150px !important;
  }

  .row .userId,
  .row .postId {
    width: 60px !important;
    min-width: 60px !important;
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

  .questions .itemId {
    width: 60px;
    min-width: 60px;
  }

  .questions .scaleId {
    width: 70px;
    min-width: 70px;
  }

  .questions .question {
    max-width: 250px;
    width: 250px;
    min-width: 250px;
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

  .csv_download {
    margin-bottom: 25px;
  }

  .csv_download a {
    color: white;
  }

  .button_wrapper {
    display: flex;
  }
</style>
