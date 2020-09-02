<template>
  <transition name="opacity">
    <whiteboard />
  </transition>
</template>
<script>
import whiteboard from "./views/whiteBoard";
export default {
  data() {
    return {};
  },
  components: {
    whiteboard,
  },
  mounted() {
    // removing preloader
    setTimeout(() => {
      let preloader = document.getElementById("preloader");
      preloader.style.transition = ".3s";
      preloader.style.opacity = 0;
      setTimeout(() => preloader.parentNode.removeChild(preloader), 300);
    }, 1000);
  },
  methods: {},
  watch: {},
  computed: {},
};
</script>
<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: white;
  overflow: hidden;
}
</style>
