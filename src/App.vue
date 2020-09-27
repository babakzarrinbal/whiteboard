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
    // this.event.emit('test',"test")
    let remoteMsg = window.location.hash.slice(1);
    window.location.hash = "";
    if (remoteMsg) {
      this.server = false;
      try {
        remoteMsg = JSON.parse(decodeURIComponent(remoteMsg));
      } catch (e) {
        console.error(e,decodeURIComponent(remoteMsg));

        // alert("provided link is not correct!!!");
        // window.location = window.location.href.slice(
        //   0,
        //   window.location.href.indexOf("#")
        // );
      }
    } else return;
    let conn = await webRTC(remoteMsg.offer);
    conn.channel.on("*", (ev, m) => {
      if (ev == "profile") return;
      this.event.emit(ev, m);
      for (let gu of this.$root.group)
        if (gu.id != 1) gu.connection.channel.emit(ev, m);
    });
    let answer = encodeURIComponent(
      JSON.stringify({ answer: conn.answer, id: remoteMsg.id })
    );

    let profile = {};
    conn.channel.on("profile", (p) => {
      profile.name = p.name;
      profile.img = p.img;
      this.$forceUpdate();
    });

    conn.channel.emit("profile", {
      name: this.$root.mypname,
      img: this.$root.mypimg,
    });
    let user = {
      connection: conn,
      connecting: true,
      id: 1,
      answered: true,
      profile,
      offerLink: window.location.href,
      showdetail: true,
      answer,
    };
    this.$root.group.push(user);
    conn.connectionPromise.then(() => {
      conn.connected = true;
      user.connecting = false;
      conn.channel.dataChannel.onclose = () => {
        this.$root.group = this.$root.group.filter((g) => g.id != 1);
      };
    });
    this.$root.client = true;
    this.showpopup = true;
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
      for (let g of this.$root.group)
        g.connection.channel.emit("canvasClear", {});
    },
    sendDrawing(drawing) {
      for (let g of this.$root.group)
        g.connection.channel.emit("canvasDraw", drawing);
    },
  },
  watch: {
    "$root.group": {
      deep: true,
      handler() {},
    },
  },
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
