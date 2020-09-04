<template>
  <div id="popup" @click.stop="$emit('answer')">
    <div
      class="modal d-flex flex-column p-2"
      style="max-width:100%;max-height:100%;overflow:auto;width:300px;height:300px;"
      @click.stop
    >
      <span class="border-bottom border-primary p-3 mb-2 w-100">{{text}}</span>
      <input
        type="text"
        placeholder="answer"
        v-model="answer"
        class="border-bottom border-primary my-2"
      />
      <div class="btn btn-succes w-100" @click.stop="$emit('answer',answer)">submit</div>
    </div>
  </div>
</template>

<style lang="scss">
#popup {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<script>
export default {
  props: {
    text: String,
    
  },
  data(){
    return{
      answer:""
    }
  }
};
</script>
