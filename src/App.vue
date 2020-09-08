<template>
  <transition-group name="opacity">
    <whiteboard
      :style="showpopup?'filter:blur(4px)':''"
      @clear="clearDrawing"
      @draw="sendDrawing"
      @show-group="showpopup = true"
      key="1"
    />
    <popup v-if="showpopup" @dismiss="showpopup = false" key="2" />
  </transition-group>
</template>
<script>
import whiteboard from "./views/whiteBoard";
import popup from "./components/popup";
import webRTC from "./utils/webRTC";
import { eventBus } from "./eventBus";
export default {
  data() {
    return {
      console: window.console,
      showpopup: false,
      conn: null,
      server: true,
    };
  },
  components: {
    whiteboard,
    popup,
  },
  //create offer link > return offer link , callback to create connection, close connection
  // callback with answer > event emitter for listen and emit

  //on client alert with answer
  // on connect create client event emitter
  async created() {
    return;
    let remoteMsg = window.location.hash.slice(1);
    if (remoteMsg) {
      this.server = false;
      try {
        remoteMsg = JSON.parse(decodeURIComponent(remoteMsg));
      } catch (e) {
        console.error(e);
        alert("provided link is now correct!!!");
        window.location = window.location.href.slice(
          0,
          window.location.href.indexOf("#")
        );
      }
    }
    this.conn = await webRTC(remoteMsg);
    this.conn.channel.on("canvasDraw", (m) => eventBus.$emit("canvasDraw", m));
    this.conn.channel.on("canvasClear", (m) =>
      eventBus.$emit("canvasClear", m)
    );
    if (this.conn.offer) {
      console.log(
        window.location +
          "#" +
          encodeURIComponent(JSON.stringify(this.conn.offer))
      );
      let ans = window.prompt('Answer');
      if(!ans) return;
      ans = decodeURIComponent(ans);
      this.conn.setAnswer(JSON.parse(ans));
    } else console.log(encodeURIComponent(JSON.stringify(this.conn.answer)));
  },
  mounted() {
    // removing preloader
    window.setTimeout(() => {
      let preloader = document.getElementById("preloader");
      if (!preloader) return;
      preloader.style.transition = ".3s";
      preloader.style.opacity = 0;
      setTimeout(() => preloader.parentNode.removeChild(preloader), 300);
    }, 1000);
  },
  methods: {
    clearDrawing() {
      this.conn.channel.emit("canvasClear", {});
    },
    sendDrawing(drawing) {
      this.conn.channel.emit("canvasDraw", drawing);
    },
    async createconnection() {
      this.conn = await webRTC();
      this.conn.channel.on("canvasDraw", (m) => {
        eventBus.$emit("canvasDraw", m);
      });
      this.conn.channel.on("canvasClear", (m) => {
        eventBus.$emit("canvasClear", m);
      });

      console.log(
        window.location +
          "#" +
          encodeURIComponent(JSON.stringify(this.conn.offer))
      );
      let ans = window.prompt(
        window.location +
          "#" +
          encodeURIComponent(JSON.stringify(this.conn.offer))
      );
      ans = decodeURIComponent(ans);
      this.conn.setAnswer(JSON.parse(ans));
      //  else console.log(encodeURIComponent(JSON.stringify(this.conn.answer)));
    },
    popupanswer() {},
  },
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
