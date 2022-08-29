<template>
  <div class="messagebox">
    <slot></slot>

    <div class="ok">OK</div>
  </div>
</template>

<script setup>
  import {} from '@ionic/vue';
</script>

<style scoped>
  .messagebox {
    width: 85%;
        max-width: 560px;
    background: rgba(255, 255, 255, 0.371);
    border-radius: 5px;
    padding: 10px 20px;
    position: fixed;
    bottom: 90px;
    z-index: 99999;
    right: 0;
    left: 0;
    margin-right: auto;
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .ok {
    margin-left: auto;
    padding: 5px 20px;
    background: rgba(255, 255, 255, 0.334);
    cursor: pointer;
    border-radius: 5px;
  }

  .v-enter-active,
  .v-leave-active {
    transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .v-enter-from,
  .v-leave-to {
    bottom: -50px;
    opacity: 0;
  }

  /* .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  } */
</style>
