<template>
  <ul class="list-group">
    <li class="list-group-item flex-center flex-column">
      <div
        class="my-pimg flex-center mb-1 text-dark clickable btn-raised"
        style="height:70px;width:70px;border:1px solid black; border-radius:50%;overflow:hidden;"
        :class="{'p-0 bg-dark':$root.mypimg,'p-2':!$root.mypimg}"
        @click="$refs.fileinput.click()"
      >
        <img :src=" $root.mypimg?$root.mypimg:'img/icon/default-user.svg'" alt />
      </div>
      <input
        type="file"
        ref="fileinput"
        @change="uploadimg"
        class="d-none"
        accept="image/x-png, image/gif, image/jpeg"
      />
      <input
        type="text"
        :style="$root.mypname.slice(0,7) ==='no_name'?'color:gray;':''"
        class="pname w-100"
        @change="updateName"
        v-model="$root.mypname"
      />
    </li>
    <li
      class="list-group-item list-group-item-action d-flex align-items-center clickable"
      @click="addUser"
    >
      <div
        class="pimg flex-center p-1"
        style="height:40px;width:40px;border:1px solid gray; border-radius:50%;overflow-hidden"
      >
        <img src="img/icon/add-user.svg" alt />
      </div>
      <div class="detail ml-2">ADD New User</div>
    </li>
    <li
      class="list-group-item list-group-item-action d-flex flex-column"
      v-for="(u,i) in $root.group"
      :key="i"
    >
      <div
        class="userinfo d-flex w-100 align-items-center clickable"
        @click="u.showdetail = !u.showdetail"
      >
        <div
          class="pimg flex-center p-1"
          style="height:40px;width:40px;border:1px solid gray; border-radius:50%;overflow-hidden"
        >
          <img :src="u.profile.img || 'img/icon/default-user.svg'" alt />
        </div>
        <div class="detail ml-2 flex-grow-1">
          <span>{{u.profile.name || 'noname'}}</span>
          <span v-if="u.connecting">
            <span class="spinner-grow spinner-grow-xs ml-2" role="status" aria-hidden="true"></span>
            <span
              class="spinner-grow spinner-grow-1 spinner-grow-xs mx-1"
              role="status"
              aria-hidden="true"
            ></span>
            <span
              class="spinner-grow spinner-grow-2 spinner-grow-xs"
              role="status"
              aria-hidden="true"
            ></span>
          </span>
          <span class="float-right text-danger" @click.stop="removeUser(u)">X</span>
        </div>
      </div>
      <div class="usrdetail" v-if="!u.answered || u.showdetail">
        <div class="my-2 offer position-relative py-2">
          <span
            class="p-1"
            style="background-color:#323dff;color:white;border-radius:4px;max-width:200px;display:block;overflow-x: scroll;white-space: nowrap;"
          >{{u.offerLink}}</span>
          <div
            class="share position-absolute clickable"
            style="top:10px;right:10px;"
            @click.stop="copy(u.offerLink)"
          >
            <img
              style="width:25px;height:25px;background-color:#ffffff8c;"
              src="img/icon/copy.svg"
              alt
            />
          </div>
          <div
            v-if="shareEnabled"
            class="copy position-absolute clickable"
            style="top:10px;right:50px"
            @click.stop="share(u.offerLink)"
          >
            <img
              style="width:25px;height:25px;background-color:#ffffff8c;"
              src="img/icon/share.svg"
              alt
            />
          </div>
        </div>
        <div class="my-2 offer position-relative py-2" v-if="u.answered">
          <span
            class="p-1"
            style="background-color:#07ce07;color:white;border-radius:4px;max-width:200px;display:block;overflow-x: scroll;white-space: nowrap;"
          >{{u.answer}}</span>
          <div
            class="share position-absolute clickable"
            style="top:10px;right:10px;"
            @click.stop="copy(u.answer)"
          >
            <img
              style="width:25px;height:25px;background-color:#ffffff8c;"
              src="img/icon/copy.svg"
              alt
            />
          </div>
          <div
            v-if="shareEnabled"
            class="copy position-absolute clickable"
            style="top:10px;right:50px"
            @click.stop="share(u.answer)"
          >
            <img
              style="width:25px;height:25px;background-color:#ffffff8c;"
              src="img/icon/share.svg"
              alt
            />
          </div>
        </div>
        <div v-if="!u.answered" class="answer d-flex flex-column">
          <textarea placeholder="Answer" v-model="u.answer"></textarea>
        </div>
        <div
          v-if="!u.answered"
          class="w-100 my-2 btn btn-success flex-center"
          @click="confirmUser(u)"
        >
          <span>confirm</span>
        </div>
      </div>
    </li>
  </ul>
</template>
<style lang="scss" scoped>
.pname {
  text-align: center;
  border: none;
  font-weight: bold;
  background: inherit;
  border-bottom: 1px solid transparent;
  &:focus {
    border: none;
    outline: none;
    border-bottom: 1px solid blue;
  }
}
</style>
<script>
import webRTC from "../utils/webRTC";
import { eventBus } from "../eventBus";
export default {
  data() {
    return {
      shareEnabled: "share" in window.navigator,
    };
  },
  created() {},
  methods: {
    async uploadimg(e) {
      this.$root.mypimg = await this.adjustImg(e.target.files[0]);
      this.$refs.fileinput.files = null;
      this.$refs.fileinput.value = "";
      window.localStorage.setItem("wb-mypimg", this.$root.mypimg);
      for (let gu of this.$root.group)
          gu.connection.channel.emit('profile', {img:this.$root.mypimg});
    },
    adjustImg(file) {
      return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = function () {
          var image = new Image();
          image.onload = function () {
            // Resize the image
            var canvas = document.createElement("canvas"),
              max_size = 100, // TODO : pull max size from a site config
              width = image.width,
              height = image.height;
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(image, 0, 0, width, height);
            var dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
          };
          image.src = this.result;
        };
        reader.readAsDataURL(file);
      });
    },
    updateName() {
      window.localStorage.setItem("wb-mypname", this.$root.mypname);
      for (let gu of this.$root.group)
          gu.connection.channel.emit('profile', {name:this.$root.mypname});
    },
    async addUser() {
      let connection = await webRTC();
      let id =
        this.$root.group.reduce((cu, c) => (cu > c.id ? cu : c.id), 0) + 1;
      connection.channel.on("*", (ev, m) => {
        if (ev == "profile") return;
        eventBus.$emit(ev, m);
        for (let gu of this.$root.group)
          if (gu.id != id) gu.connection.channel.emit(ev, m);
      });
      connection.channel.dataChannel.onclose = () => {
        this.$root.group = this.$root.group.filter((g) => g.id != 1);
      };
      let profile = {};
      connection.channel.on("profile", (p) => {
        if(p.name) profile.name = p.name;
        if(p.img) profile.img = p.img;
        this.$forceUpdate();
      });
      connection.channel.emit("profile", {
        name: this.$root.mypname,
        img: this.$root.mypimg,
      });
      let user = {
        connection,
        id,
        connecting: true,
        answered: false,
        profile,
        answer: "",
        showdetail: false,
        offerLink:
          window.location +
          "#" +
          encodeURIComponent(JSON.stringify({ offer: connection.offer, id })),
      };
      connection.connected.then(() => {
        user.connecting = false;
      });
      this.$root.group.push(user);
    },
    async confirmUser(user) {
      let ans;
      try {
        ans = JSON.parse(window.decodeURIComponent(user.answer));
      } catch (e) {
        return window.alert("error parsing answer");
      }
      let usr = this.$root.group.find((u) => u.id == ans.id);
      console.log(usr.id);
      if (!usr || usr.answered === true)
        return window.alert("wrong or duplicated answer!!!");
      usr.connection.setAnswer(ans.answer);
      await usr.connection.connected;
      console.log("added");
      usr.answered = true;
    },
    removeUser(user) {
      user.connection.pc.close();
      this.$root.group = this.$root.group.filter((g) => g.id !== user.id);
    },
    share(text) {
      window.navigator.share({
        title: "invite link to whiteboard app",
        url: "babakzarrinbal.github.io/whiteboard",
        text,
        files: null,
      });
    },
    copy(text) {
      if (!text) return;
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      alert("Text copied to clipboard!!!");
    },
  },
  watch: {
    "$root.group": {
      deep: true,
      handler() {},
    },
  },
};
</script>

<style>
</style>