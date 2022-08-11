<template>
  <base-layout>
    <h1><a href="https://day.js.org/docs/en">https://day.js.org/docs/en</a></h1>

    <div>dayjs().format() : {{ date }}</div>
    <div>dayjs().date() : {{ date2 }}</div>
    <div>dayjs().month() : {{ date3 }}</div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs';

  let date = dayjs().format();
  let date2 = dayjs().date();
  let date3 = dayjs().month();
</script>
