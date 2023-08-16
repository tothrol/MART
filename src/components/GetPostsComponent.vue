<template>
  <div class="getPostsOptions">
    <div>
      <input type="number" min="0" max="100" v-model="perPage" /> Posts per Page
      (max 100)
    </div>

    <div>
      <input
        type="number"
        min="0"
        v-model="page"
        :disabled="getAll || useOffset"
      />Page
    </div>
    <div>
      <input
        type="number"
        min="0"
        v-model="offset"
        :disabled="getAll || !useOffset"
      />
      Offset (Number of posts to be skipped)
    </div>
    <div>
      <input
        value="false"
        id="useOffset"
        type="checkbox"
        v-model="useOffset"
        :disabled="getAll"
      />
      <label
        class="useOffsetLabel"
        :class="getAll ? 'disabled' : ''"
        for="useOffset"
        >use Offset instead of Page</label
      >
    </div>
    <div>
      <input
        value="false"
        id="getAllPosts"
        type="checkbox"
        v-model="getAll"
        :disable="useOffset"
      />
      <label for="getAllPosts">get all Posts (use with Caution)</label>
    </div>
    <div class="firstLast">
      <b>Query:</b><br />
      1st post: {{ firstPost }} <br />last post: {{ lastPost }} <br />
      posts: {{ amountPosts }}
    </div>
  </div>
  <div class="buttons">
    <ion-button @click="getPosts()" color="medium">Aktualisieren</ion-button>
  </div>
</template>

<script setup>
  import { reactive, computed, watch, defineEmits, defineProps } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useEvaluationStore } from '@/stores/evaluationStore';

  const emit = defineEmits(['getPosts', 'setFilenameValues']);

  const props = defineProps(['perPage']);

  const evaluationStore = useEvaluationStore();

  onMounted(async () => {
    getPosts();
  });

  let perPage = ref(props.perPage ? props.perPage : 100);

  let page = ref(1);
  let offset = ref(0);
  let getAll = ref(false);
  let useOffset = ref(false);

  let firstPost = computed(() => {
    let first;

    if (useOffset.value) {
      first = offset.value + 1;
    } else {
      first = page.value * perPage.value - perPage.value + 1;
    }

    return first;
  });

  let lastPost = computed(() => {
    let last;

    if (useOffset.value) {
      last = offset.value + perPage.value;
    } else {
      last = page.value * perPage.value;
    }

    return last;
  });

  let amountPosts = computed(() => {
    return lastPost.value - firstPost.value + 1;
  });

  function getPosts() {
    emit(
      'getPosts',
      getAll.value,
      perPage.value,
      page.value,
      offset.value,
      useOffset.value
    );

    emit('setFilenameValues', firstPost.value, lastPost.value);
  }

  // function createFileName(string) {
  //   if (!getAll.value) {
  //     return `${string}-${firstPost.value}-${lastPost.value}.csv`;
  //   } else {
  //     return `${string}-all.csv`;
  //   }
  // }
</script>

<style scoped>
  .buttons {
    min-height: 0;
  }
  .getPostsOptions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    margin-bottom: 10px;
  }

  .getPostsOptions input[type='number'] {
    width: 75px;
    font-size: 20px;
    margin-right: 10px;
    background-color: white;
  }

  .getPostsOptions input[type='number']:disabled {
    background-color: rgb(133, 133, 133);
  }

  #getAllPosts,
  #useOffset {
    width: 0;
  }

  .useOffsetLabel.disabled::before {
    background-color: rgb(133, 133, 133);
  }
</style>
