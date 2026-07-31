<template lang="pug" src="./index.pug"></template>

<script>
import { setData, setMeta } from '~/resources/utils'
import PageSections from '~/components/page-sections'

// /blog renders the first page of the listing directly. It used to be a
// middleware redirect to /blog/page/1, which a static build can only run
// client side — crawlers got an empty shell carrying the homepage's meta tags.
export default {
  transition: 'fade',
  components: {
    PageSections
  },
  async asyncData () {
    const data = await setData('blog')
    return { props: data }
  },
  mounted () {
    this.$nextTick(() => {
      if (!this.$store.state.siteLoaded) {
        this.$store.dispatch('VIEW_SITE', true)
      }
    })
  },
  head () {
    return setMeta(this.props, this.$route.path)
  }
}
</script>
