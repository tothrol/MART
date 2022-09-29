<template>
  <div class="menu_wrapper" @click="$emit('toggleMenu')">
    <div class="menu">
      <router-link
        class="menu_entry"
        v-for="link of menuEntries"
        :to="link.route"
        slot="end"
        :key="link.route"
      >
        {{ link.name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
  let menuEntries = [
    {
      name: 'Home',
      route: '/home',
    },
    {
      name: 'Begrüßungstext',
      route: '/welcome',
    },

    { name: 'Briefing Kurzfragebogen', route: '/briefing-short' },
    { name: 'Datenschutz', route: '/compliance' },
    { name: 'User', route: '/user' },
  ];
</script>

<style scoped>
  .menu_icon {
    width: 40px;
    font-size: 40px;
    display: block;
    margin: 0;
  }

  .t {
  }

  .menu_wrapper {
    width: 100vw;
    height: calc(100vh);
    background-color: var(--ion-color-secondary-opacy);
    position: absolute;
    margin-top: 0px;
    z-index: 99999100;
    backdrop-filter: blur(5px);
  }

  .menu {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    font-size: 25px;
    background-color: var(--ion-color-secondary-opacy2);
    backdrop-filter: blur(30px);
    top: 50px;
    right: 10px;
    min-width: 200px;
    min-height: 100px;

    padding: 15px;
    /* box-shadow: var(--box_shadow); */
    border-radius: 5px;
    /* background-color: var(--ion-color-secondary-opacy); */
  }

  .menu_entry {
    text-decoration: none;
    padding: 5px 0px;
  }
</style>
