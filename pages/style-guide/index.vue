<template lang="pug" src="./index.pug"></template>

<script>
import { getAllPages, setData, setMeta } from '~/resources/utils'
import DevModeComponentLocations from '~/components/dev-mode/dev-mode-component-locations'
import PageSections from '~/components/page-sections'
import StyleGuide from '~/components/style-guide-component'

export default {
  components: {
    DevModeComponentLocations,
    PageSections,
    StyleGuide
  },
  async asyncData () {
    const props = await setData('style-guide')
    const allPages = await getAllPages()
    return { props, allPages }
  },
  head () {
    return setMeta(this.props, this.$route.path, { noindex: true })
  }
}
</script>
