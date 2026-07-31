<template lang='pug' src='./index.pug'></template>

<script>
import { setData, setMeta } from '~/resources/utils'
import PageSections from '~/components/page-sections'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  async asyncData () {
    const props = await setData('test')
    return { props }
  },
  head () {
    return setMeta(this.props, this.$route.path, { noindex: true })
  }
}
</script>
