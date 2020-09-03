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
  //create offer link > return offer link , callback to create connection, close connection
  // callback with answer > event emitter for listen and emit

  //on client alert with answer
  // on connect create client event emitter
  async created() {
    let lastIceResolver;
    let getIce = new Promise((r) => (lastIceResolver = r));
    let pc = new RTCPeerConnection();
    pc.ondatachannel = (e) =>
      (e.channel.onmessage = (msg) =>
        console.log("received message", msg.data));
    let remoteMsg = window.location.hash.slice(1);
    if (remoteMsg) {
      try {
        remoteMsg = JSON.parse(decodeURIComponent(remoteMsg));
      } catch (e) {
        console.error(e);
        alert("provided link is now correct!!!");
        window.location = window.location.href.slice(
          0,
          window.location.href.indexOf("#")
        );
        return;
      }
    } else {
      remoteMsg = {};
    }
    let dataChannel = pc.createDataChannel("dataChannel");
    dataChannel.onopen = () => {
      dataChannel.send("test message");
      dataChannel.onmessage= console.log;
      console.log("sender opened");
    };
    pc.onconnectionstatechange = (...args) => console.log("stat change", args);
    pc.onicecandidate = (e) => {
      if (!e.candidate) return lastIceResolver();
      remoteMsg.candidate = e.candidate;
    };
    if (remoteMsg.offer) {
      pc.setRemoteDescription(remoteMsg.offer)
        .then(() => pc.createAnswer())
        .then((answer) => pc.setLocalDescription(answer))
        .then(async () => {
          await getIce; 
          console.log(JSON.stringify(pc.localDescription));
        })
        .catch(console.error);
    } else {
      pc.createOffer()
        .then((o) => {
          pc.setLocalDescription(o);
        })
        .catch(console.error);
      await getIce;
      remoteMsg.offer = pc.localDescription;
      console.log(
        window.location.href +
          "#" +
          encodeURIComponent(JSON.stringify(remoteMsg))
      );
      let answer = window.prompt("answer");
      pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
    }
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
