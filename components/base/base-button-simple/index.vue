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
      default: 'text'
    },
    noArrow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayLabel () {
      return ['Contact Us', 'Call Now'].includes(this.props?.label) ? 'Schedule Now' : this.props?.label
    },
    buttonStyles () {
      return { '--simple-btn-clr': `var(--${this.variant}, #272727)` }
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
