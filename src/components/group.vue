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
    <li class="list-group-item list-group-item-action d-flex">
      <div
        class="pimg flex-center p-1"
        style="height:40px;width:40px;border:1px solid gray; border-radius:50%;overflow-hidden"
      >
        <img src="img/icon/add-user.svg" alt />
      </div>
      <div class="detail"></div>
    </li>
    <li class="list-group-item list-group-item-action d-flex">
      <div
        class="pimg flex-center p-1"
        style="height:40px;width:40px;border:1px solid gray; border-radius:50%;overflow-hidden"
      >
        <img src="img/icon/add-user.svg" alt />
      </div>
      <div class="detail"></div>
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
export default {
  data() {
    return {
      mypimg: window.localStorage.getItem('wb-mypimg'),
      mypname: window.localStorage.getItem('wb-mypname')||"no_name",
    };
  },
  created(){
  },
  methods: {
    async uploadimg(e) {
      this.mypimg = await this.adjustImg(e.target.files[0]);
        this.$refs.fileinput.files = null;
      this.$refs.fileinput.value = "";
      window.localStorage.setItem('wb-mypimg',this.mypimg);
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
    updateName(){
      window.localStorage.setItem('wb-mypname',this.mypname)
    }
 },
};
</script>

<style>
</style>