<template>
  <span>
    <span
      :class="spinnerClass"
      class="spinner-grow spinner-grow-xs ml-2"
      role="status"
      aria-hidden="true"
    ></span>
    <span
      :class="spinnerClass"
      class="spinner-grow spinner-grow-1 spinner-grow-xs mx-1"
      role="status"
      aria-hidden="true"
    ></span>
    <span
      :class="spinnerClass"
      class="spinner-grow spinner-grow-2 spinner-grow-xs"
      role="status"
      aria-hidden="true"
    ></span>
  </span>
</template>

<script>
export default {
  props: {
    spinnerClass: {
      default: "",
      type: String,
    },
  },
};
</script>

<style scoped>
.spinner-grow {
  animation: spinner-grow 0.98s linear infinite;
}
.spinner-grow.spinner-grow-1 {
  animation-delay: 0.2s;
}
.spinner-grow.spinner-grow-2 {
  animation-delay: 0.4s;
}
</style>