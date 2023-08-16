<template>
  <base-layout>
    <div class="box">
      <h2 class="h2_stats">Antworten Kurzfragebogen</h2>
      <GetPostsComponent
        @getPosts="getPosts"
        @setFilenameValues="setFilenameValues"
      ></GetPostsComponent>

      <AnswersComponent
        :ans="answersFromStore"
        :questions="questionsFromStore"
        :scales="scalesFromStore"
        :answerType="answerType"
        :filenameFirstPost="filenameFirstPost"
        :filenameLastPost="filenameLastPost"
        :getAll="getAll"
      ></AnswersComponent>
    </div>
    <Transition>
      <MessageboxComponent v-if="false" @click="showMessage = false"
        >Here is a message</MessageboxComponent
      >
    </Transition>
    <div class="devbox" v-if="userStore.showDevbox">
      <ion-button
        color="medium"
        @click="
          questionsStore.initialAnswerExist = !questionsStore.initialAnswerExist
        "
        >Toggel initialAnswerExistl</ion-button
      >{{ questionsStore.initialAnswerExist }}

      <ion-button
        color="medium"
        @click="questionsStore.checkIfInitialAnswerExists"
        >checkIfInitialAnswersExists</ion-button
      >{{ questionsStore.initialAnswerExist }}
    </div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { useQuestionsStore } from '@/stores/questionsStore';
  import { useEvaluationStore } from '@/stores/evaluationStore';
  import AnswersComponent from '@/components/AnswersComponent.vue';
  import MessageboxComponent from '../components/MessageboxComponent.vue';
  import GetPostsComponent from '../components/GetPostsComponent.vue';

  const userStore = useUserStore();
  const questionsStore = useQuestionsStore();
  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    // evaluationStore.getInitialAnswers();
    // evaluationStore.getShortAnswers();

    questionsStore.getInitialQuestions();
    questionsStore.getShortQuestions();
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
      'antworten_kurzfrageb'
    );

    console.log('DeviceStats - result', result);
    if (result.status != 200) {
      let appMessage = `Es gab einen Fehler bei der Serveranfrage: ${result.response.data.code}, ${result.response.data.message}`;
      userStore.appMessage = appMessage;
      userStore.showAppMessage = true;
    }
  }

  let showMessage = ref(true);

  let answerType = ref('short');

  let answersFromStore = computed(() => {
    return evaluationStore.answersShort;
  });

  let questionsFromStore = computed(() => {
    return questionsStore.questionsShort;
  });

  let scalesFromStore = computed(() => {
    return questionsStore.scalesShort;
  });

  // START Filename
  let filenameFirstPost = ref(0);
  let filenameLastPost = ref(0);

  function setFilenameValues(firstPost, lastPost) {
    console.log('setFilenameValues: ', firstPost, lastPost);
    filenameFirstPost.value = firstPost;
    filenameLastPost.value = lastPost;
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
</style>
