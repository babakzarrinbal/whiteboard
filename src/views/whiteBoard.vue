<!-- todos
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
        <strong>[Your browser can not show this example.]</strong>
      </canvas>
    </div>
    <div
      class="settings"
      style="background-color:#0000ff75;width:50px;height:50px;border-radius:50%;position:absolute;left:10px;bottom:10px;display:flex;cursor:pointer;user-select:none;justify-content:center;align-items:center;"
      v-if="!capturing"
      @click="settingVisible = !settingVisible"
    >...</div>
    <div
      v-if="!capturing && settingVisible"
      class="controls"
      style="position:absolute;left:70px;bottom:0px;display:flex;flex-direction:column;justify-content:center;align-items:center"
    >
      <div class="tips" style="display:flex;align-items:center;justify-content:center;">
        <input
          type="color"
          v-model="strokeStyle"
          style="min-width:5px;min-height:5px;padding:0;border-radius:50%;overflow:hidden;border:1px solid black;margin-right:5px;"
          :style="{width:lineWidth+'px',height:lineWidth+'px'}"
          :disabled="eraser"
        />
        <div class="eraser">
          <input type="checkbox" v-model="eraser" id="eraser" />
          <label for="eraser" style="margin:0;">Eraser</label>
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
      style="position:absolute;left:10px;bottom:70px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start"
    >
      <input type="button" @click="clearCanvas(false)" value="clear" style="margin-bottom:5px;" />
      <input type="button" @click="save" value="save" style="margin-bottom:5px;" />
      <input type="button" @click="fullscreen" value="fullscreen" style="margin-bottom:5px;" />
    </div>
  </div>
</template>

<style >
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
import {eventBus} from "../eventBus";
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
      // lineWidth: 20,
      strokeStyle: "#005AFF",
      backColor: "rgb(255,255,255)",
      eraser: false,
      capturing: false,
    };
  },
  // components:{Sketch},
  mounted() {
    this.canvas = this.$refs.cbook;
    this.can_height = window.screen.height;
    this.can_width = window.screen.width;
    this.context = this.canvas.getContext("2d");
    this.context.globalCompositeOperation = "destination-atop";
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.eraser
      ? this.backColor
      : this.strokeStyle.hex8 || this.strokeStyle;
    this.context.lineCap = "round";
    this.context.beginPath();

    this.canvas.onmousedown = this.startDraw;
    this.canvas.onmouseup = this.stopDraw;
    this.canvas.ontouchstart = this.startDraw;
    this.canvas.ontouchstop = this.stopDraw;
    this.canvas.ontouchmove = this.drawMouse;

    eventBus.$on('canvasDraw',this.drawRemoteLines);
    eventBus.$on('canvasClear',()=>this.clearCanvas(true));
  },
  methods: {
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
    clearCanvas(remote=false) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if(!remote)this.$emit("clear");
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
    strokeStyle(val) {
      console.log(val);
    },
  },
};
</script>
