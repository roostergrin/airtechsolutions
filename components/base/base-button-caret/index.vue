<template lang="pug" src="./index.pug" ></template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    variant: {
      type: String,
      default: 'primary'
    }
  },
  computed: {
    buttonStyles () {
      return { '--caret-btn-clr': `var(--${this.variant}, #272727)` }
    }
  },
  methods: {
    onClick () {
      this.$emit('onClick')
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
