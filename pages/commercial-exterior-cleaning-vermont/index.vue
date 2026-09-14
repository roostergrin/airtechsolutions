<template lang="pug" src="./index.pug"></template>

<script>
import PageSections from '~/components/page-sections'
import { setMeta } from '~/resources/utils'
import { setLocationPage } from '~/resources/location-pages'

export default {
  transition: 'fade',
  components: { PageSections },
  asyncData () {
    return { props: setLocationPage('commercial-exterior-cleaning-vermont') }
  },
  head () {
    return setMeta(this.props, this.$route.path)
  }
}
</script>
