<template lang="pug" src="./index.pug"></template>

<script>
import PageSections from '~/components/page-sections'
import { setJSONData, setMeta } from '~/resources/utils'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  data () {
    return {
      props: {}
    }
  },
  // eslint-disable-next-line require-await
  async asyncData () {
    const props = setJSONData('commercial-air-quality-testing-boston-west-newton-ma')
    return { props }
  },
  head () {
    return setMeta(this.props, this.$route.path)
  }
}
</script>
