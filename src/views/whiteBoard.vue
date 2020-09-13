<!-- todos
  group draw
  save/restore with canvas resize
  group canvas aspect ratio
  on dbclick or click hold add text (or add menu)
  adding text abilities
  fix ui 
  adding moveable image(drop) and text(on start writing at last mouse/touch position)
 -->

<template>
  <div
    ref="container"
    style="position:relative;width:100%;height:100%;background-color:white;overflow:hidden;"
  >
    <!-- <div
      contenteditable="true"
      name
      style="position:absolute;top:10px;right:10px;z-index:3;font-size:25px;"
    >sampletext</div>-->
    <div
      class="canvascontainer"
      style="position:relative;width:vw;height:vh;background-color:white;"
    >
      <canvas
        ref="cbook"
        :width="can_width"
        :height="can_height"
        style="position: relative;"
        :style="eraser?'cursor: no-drop;':''"
      >
        <!-- @dblclick="console.log('test')" -->
        <strong>[Your browser can not show this example.]</strong>
      </canvas>
    </div>
    <div
      class="settings"
      style="border:1px solid black;padding:8px;background-color:rgb(63 117 255);width:40px;height:40px;border-radius:50%;position:absolute;left:10px;bottom:10px;display:flex;cursor:pointer;user-select:none;justify-content:center;align-items:center;"
      v-if="!capturing"
      @click="settingVisible = !settingVisible"
      :style="'background-color:'+strokeStyle"
    >
      <img src="img/icon/draw.svg" at />
    </div>
    <div
      v-if="!capturing && settingVisible"
      class="controls"
      style="position:absolute;left:70px;bottom:0px;display:flex;flex-direction:column;justify-content:center;align-items:center"
    >
      <div
        class="tips"
        style="width:100%;display:flex;flex-direction:row-reverse;justify-content:space-between;"
      >
        <div>
          <input
            type="color"
            v-model="strokeStyle"
            style="min-width:5px;min-height:5px;padding:0;border-radius:50%;overflow:hidden;border:1px solid black;margin-right:5px;"
            :style="{width:lineWidth+'px',height:lineWidth+'px'}"
            :disabled="eraser"
          />
        </div>
        <div class="eraser" style="display:flex" @click="eraser=!eraser">
          <div
            class="button clickable btn-raised"
            :class="{'active':eraser}"
            style="transition:0s;margin-top:auto;width:30px;height:30px"
          >
            <img src="img/icon/eraser.svg" />
          </div>
          <!-- <input type="checkbox" v-model="eraser" id="eraser" />
          <label for="eraser" style="margin:0;">Eraser</label>-->
        </div>
      </div>
      <!-- <Sketch v-model="strokeStyle"/> -->
      <input
        type="range"
        list="tickmarks"
        min="1"
        max="50"
        v-model="rangeVal"
        style="min-width:200px;width:25vw;height:5vw;"
      />
    </div>
    <div
      v-if="!capturing && settingVisible"
      class="controls"
      style="position:absolute;left:10px;bottom:50px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start"
    >
      <div class="button clickable btn-raised" @click="$emit('show-group')" style="padding:8px;">
        <img src="img/icon/add-group.png" class alt />
      </div>
      <div class="button clickable btn-raised" style>
        <img src="img/icon/clean.svg" @click="clearCanvas(false)" class alt />
      </div>
      <div class="button clickable btn-raised" style="padding:8px;">
        <img src="img/icon/save.svg" @click="save" class alt />
      </div>
      <div class="button clickable btn-raised" style="padding:8px;">
        <img :src="'img/icon/fullscreen-'+(isFullscreen?'exit':'enter')+'.svg'" @click="fullscreen" />
      </div>
    </div>
  </div>
</template>

<style >
.button {
  margin-bottom: 5px;
  background-color: white;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  padding: 5px;
  border: 1px solid #848484;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

html {
  width: 100%;
  height: 100%;
}
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
input[type="color"]:disabled {
  opacity: 0.2;
}
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  width: 32px;
  height: 32px;
}
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
}
</style>
<script>
import h2c from "html2canvas/dist/html2canvas";
import { eventBus } from "../eventBus";
// import settingsVue from '../components/settings.vue';
// import {Sketch} from "vue-color";
window.h2c = h2c;
export default {
  data() {
    return {
      isFullscreen: false,
      settingVisible: false,
      canvas: null,
      context: null,
      cb_lastPoints: {},
      can_width: 400,
      can_height: 200,
      rangeVal: 10,
      // rangeVal: 40,
      // strokeStyle: "#005aff5c",
      strokeStyle: "#005AFF",

      backColor: "rgb(255,255,255)",
      eraser: false,
      capturing: false,
      console: window.console,
    };
  },
  // components:{Sketch},
  mounted() {
    this.canvas = this.$refs.cbook;
    this.context = this.canvas.getContext("2d");
    this.initDrawing();
    eventBus.$on("canvasDraw", this.drawRemoteLines);
    eventBus.$on("canvasClear", () => this.clearCanvas(true));
  },
  methods: {
    initDrawing() {
      this.can_height = window.screen.height;
      this.can_width = window.screen.width;
      this.context.beginPath();

      this.canvas.onmousedown = this.startDraw;
      this.canvas.onmouseup = this.stopDraw;
      this.canvas.ontouchstart = this.startDraw;
      this.canvas.ontouchstop = this.stopDraw;
      this.canvas.ontouchmove = this.drawMouse;
    },
    startDraw(e) {
      if (e.touches) {
        // Touch event
        for (var i = 1; i <= e.touches.length; i++) {
          let p = this.getCoords(e.touches[i - 1]);
          this.cb_lastPoints[e.touches[i - 1].identifier] = p; // Get info for finger #1
        }
      } else {
        // Mouse event
        let p = this.getCoords(e);
        this.cb_lastPoints[0] = p;
        this.canvas.onmousemove = this.drawMouse;
      }
      return false;
    },
    stopDraw(e) {
      e.preventDefault();
      this.canvas.onmousemove = null;
    },
    drawMouse(e) {
      let p;
      let lineCoords = [];
      if (e.touches) {
        // Touch Enabled
        for (var i = 1; i <= e.touches.length; i++) {
          p = this.getCoords(e.touches[i - 1]); // Get info for finger i
          let linecoord = [
            this.cb_lastPoints[e.touches[i - 1].identifier].x,
            this.cb_lastPoints[e.touches[i - 1].identifier].y,
            p.x,
            p.y,
          ];
          this.cb_lastPoints[e.touches[i - 1].identifier] = this.drawLine(
            ...linecoord
          );
          lineCoords.push(linecoord);
        }
      } else {
        // Not touch enabled
        p = this.getCoords(e);
        let linecoord = [
          this.cb_lastPoints[0].x,
          this.cb_lastPoints[0].y,
          p.x,
          p.y,
        ];
        lineCoords.push(linecoord);
        this.cb_lastPoints[0] = this.drawLine(...linecoord);
      }

      this.context.lineWidth = this.lineWidth;
      this.context.strokeStyle = this.eraser
        ? this.backColor
        : this.strokeStyle.hex8 || this.strokeStyle;
      this.context.lineCap = "round";
      if (this.strokeStyle.a && this.strokeStyle.a < 1)
        this.context.globalCompositeOperation = "xor";
      this.context.stroke();
      this.$emit("draw", {
        type: "drawLine",
        coords: lineCoords,
        lineCap: this.context.lineCap,
        strokeStyle: this.context.strokeStyle,
        lineWidth: this.context.lineWidth,
      });
      this.context.closePath();
      this.context.beginPath();
      return false;
    },
    drawLine(sX, sY, eX, eY) {
      this.context.moveTo(sX, sY);
      this.context.lineTo(eX, eY);
      return { x: eX, y: eY };
    },
    drawRemoteLines(drawing) {
      this.context.beginPath();
      for (let c of drawing.coords) {
        this.drawLine(...c);
      }
      this.context.lineWidth = drawing.lineWidth;
      this.context.strokeStyle = drawing.strokeStyle;
      this.context.lineCap = drawing.lineCap;
      this.context.stroke();
      this.context.closePath();
    },
    getCoords(e) {
      if (e.offsetX) {
        return { x: e.offsetX, y: e.offsetY };
      } else if (e.layerX) {
        return { x: e.layerX, y: e.layerY };
      } else {
        return {
          x: e.pageX - this.canvas.offsetLeft,
          y: e.pageY - this.canvas.offsetTop,
        };
      }
    },
    clearCanvas(remote = false) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (!remote) this.$emit("clear");
    },
    async save() {
      this.capturing = true;
      await this.$nextTick();
      h2c(this.$refs.container).then((canvas) => {
        let link = document.createElement("a");
        link.setAttribute("download", "MintyPaper.png");
        link.setAttribute(
          "href",
          canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream")
        );
        this.capturing = false;
        link.click();
      });
    },
    async fullscreen() {
      if (this.isFullscreen) window.document.exitFullscreen();
      else this.$refs.container.requestFullscreen();

      this.isFullscreen = !this.isFullscreen;
    },
  },
  computed: {
    lineWidth() {
      return this.rangeVal < 25
        ? this.rangeVal
        : this.rangeVal < 40
        ? this.rangeVal * 1.5
        : this.rangeVal * 2;
    },
  },
  watch: {
    tips: {
      deep: true,
      handler() {},
    },
    // strokeStyle(val) {
    //   // console.log(val);
    // },
  },
};
</script>
