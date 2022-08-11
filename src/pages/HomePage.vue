<template>
  <base-layout
    ><div>Hallo {{ userStore.userData.firstname }}</div>
  </base-layout>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();
</script>
