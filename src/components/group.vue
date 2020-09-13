<template>
  <ul class="list-group">
    <li class="list-group-item flex-center flex-column">
      <div
        class="my-pimg flex-center mb-1 text-dark clickable btn-raised"
        style="height:70px;width:70px;border:1px solid black; border-radius:50%;overflow:hidden;"
        :class="{'p-0 bg-dark':mypimg,'p-2':!mypimg}"
        @click="$refs.fileinput.click()"
      >
        <img :src=" mypimg?mypimg:'img/icon/default-user.svg'" alt />
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
        :style="mypname.slice(0,7) ==='no_name'?'color:gray;':''"
        class="pname w-100"
        @change="updateName"
        v-model="mypname"
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
        <div class="detail ml-2">{{u.profile.name || 'noname'}}</div>
      </div>
      <div class="usrdetail" v-if="!u.answered || u.showdetail">
        <div class="my-2 offer position-relative py-2">
          <span
            class="p-1"
            style="background-color:#323dff;color:white;border-radius:4px;max-width:300px;display:block;overflow-x: scroll;white-space: nowrap;"
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
            style="background-color:#07ce07;color:white;border-radius:4px;max-width:300px;display:block;overflow-x: scroll;white-space: nowrap;"
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
        <div v-if="!u.answered" class="w-100 my-2 btn btn-success" @click="confirmUser(u)">confirm</div>
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
      mypimg: window.localStorage.getItem("wb-mypimg"),
      mypname: window.localStorage.getItem("wb-mypname") || "no_name",
      shareEnabled: "share" in window.navigator,
    };
  },
  created() {},
  methods: {
    async uploadimg(e) {
      this.mypimg = await this.adjustImg(e.target.files[0]);
      this.$refs.fileinput.files = null;
      this.$refs.fileinput.value = "";
      window.localStorage.setItem("wb-mypimg", this.mypimg);
    },
    adjustImg(file) {
      return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = function () {
          var image = new Image();
          image.onload = function () {
            // Resize the image
            var canvas = document.createElement("canvas"),
              max_size = 544, // TODO : pull max size from a site config
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
      window.localStorage.setItem("wb-mypname", this.mypname);
    },
    async addUser() {
      let connection = await webRTC();
      let id =
        this.$root.group.reduce((cu, c) => (cu > c.id ? cu : c.id), 0) + 1;
      connection.channel.on("canvasDraw", (m) => {
        for (let gu of this.$root.group.filter((g) => g.id != id))
          gu.connection.emit("canvasDraw", m);
        eventBus.$emit("canvasDraw", m);
      });
      connection.channel.on("canvasClear", (m) =>{
        for (let gu of this.$root.group.filter((g) => g.id != id))
          gu.connection.emit("canvasClear", m);
        eventBus.$emit("canvasClear", m);
      });
      let user = {
        connection,
        id,
        answered: false,
        profile: {},
        answer: "",
        showdetail: false,
        offerLink:
          window.location +
          "#" +
          encodeURIComponent(JSON.stringify({ offer: connection.offer, id })),
      };
      this.$root.group.push(user);
      // console.log(connection.offer);
      // console.log(user.offerLink);
    },
    async confirmUser(user) {
      try {
        let ans;
        try {
          ans = JSON.parse(window.decodeURIComponent(user.answer));
        } catch (e) {
          return window.alert("error parsing answer");
        }
        let usr = this.$root.group.find((u) => u.id == ans.id);
        if (!usr || usr.answered === true)
          return window.alert("wrong or duplicated answer!!!");
        usr.connection.setAnswer(ans.answer);
        await usr.connection.connected;
        usr.answered = true;
      } catch (e) {
        window.alert(e.toString());
      }
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