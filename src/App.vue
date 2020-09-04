<template>
  <transition name="opacity">
    <whiteboard @clear="clearDrawing" @draw="sendDrawing" />
    <!-- <div v-if="server" class="btn btn-primary position:absolute p-0" style="right:5px;bottom:5px;" @click="createconnection">
      *
    </div> -->
    <!-- <popup v-if="showpopup" :text="popuptext" @answer="popupanswer"/> -->
  </transition>
</template>
<script>
import whiteboard from "./views/whiteBoard";
import webRTC from "./utils/webRTC";
import { eventBus } from "./eventBus";
export default {
  data() {
    return {
      showpopup: false,
      conn: null,
      server:true
    };
  },
  components: {
    whiteboard,
  },
  //create offer link > return offer link , callback to create connection, close connection
  // callback with answer > event emitter for listen and emit

  //on client alert with answer
  // on connect create client event emitter
  async created() {
    let remoteMsg = window.location.hash.slice(1);
    if (remoteMsg) {
      this.server= false;
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
    this.conn.channel.on("canvasDraw", (m) => {
      console.log("remoteDraw");
      eventBus.$emit("canvasDraw", m);
    });
    this.conn.channel.on("canvasClear", (m) => {
      console.log("remoteclear");
      eventBus.$emit("canvasClear", m);
    });
    if (this.conn.offer) {
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
    } else window.alert(encodeURIComponent(JSON.stringify(this.conn.answer)));
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
    async createconnection(){
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
    popupanswer(){},

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
