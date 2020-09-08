<template>
  <div id="popup" class="flex-center" @click.stop="$emit('dismiss')">
    <div class="popup-modal" @click.stop>
      <group/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#popup {

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0000006b;

  .popup-modal {
    background: white;
    box-shadow: 0px 5px 8px 0px #0000007a;
    border-radius: 5px;
    max-width: calc(100% - 15px);
    max-height: calc(100% - 15px);
    min-width:250px;
  }
}
</style>
<script>
import group from "./group"
export default {
  components:{
    group
  },
};
</script>
