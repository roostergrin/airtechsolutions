<template lang="pug" src="./index.pug"></template>

<script>
import PageSections from '~/components/page-sections'
import { setMeta } from '~/resources/utils'
import { setAreasWeServePage } from '~/resources/areas-we-serve'

export default {
  transition: 'fade',
  components: { PageSections },
  asyncData () {
    return { props: setAreasWeServePage() }
  },
  head () {
    return setMeta(this.props, this.$route.path)
  }
}
</script>
