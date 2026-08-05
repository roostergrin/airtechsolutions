<template lang="pug" src="./index.pug" ></template>

<script>
import { titleAnimation, fadeUpIn } from '~/resources/mixins'

export default {
  mixins: [titleAnimation, fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.$_titleAnimation(this.$refs.tsTitle)
    this.$refs.tsParagraphs.forEach((item, i) => {
      this.$_fadeUpIn(item, 40, 'top+=64 bottom')
    })
    // this.$nextTick(() => {
    // })
  },
  methods: {
    paragraphHeading (paragraph) {
      if (this.props.component_options?.hash !== 'service-details') {
        return ''
      }

      const match = String(paragraph.text || '').match(/^<strong>([^<]+)<\/strong><br\s*\/?>/i)
      return match ? match[1] : ''
    },
    paragraphBody (paragraph) {
      const heading = this.paragraphHeading(paragraph)

      if (!heading) {
        return paragraph.text
      }

      return String(paragraph.text).replace(/^<strong>[^<]+<\/strong><br\s*\/?>/i, '')
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
