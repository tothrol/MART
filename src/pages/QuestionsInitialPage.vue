<template>
  <base-layout
    ><div>Hallo {{ userStore.userData.firstname }}</div>
    <div>https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen</div>

    <ion-button @click="getQuestionsInitial"
      >Axios get Questions Initial</ion-button
    >

    {{ posts }}
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import axios from 'axios';

  const userStore = useUserStore();

  let posts = ref({});

  let errors = ref({});

  function getQuestionsInitial() {
    axios
      .get(`https://fuberlin.nvii-dev.com/wp-json/wp/v2/fragebogen`)
      .then((response) => {
        // JSON responses are automatically parsed.
        posts.value = response.data;
      })
      .catch((e) => {
        errors.value.push(e);
      });
  }
</script>
