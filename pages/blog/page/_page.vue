<template lang="pug" src="./_page.pug"></template>

<script>
import { setData, setMeta, withPageNumber } from '~/resources/utils'
import PageSections from '~/components/page-sections'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  computed: {
    // /blog/page/1 duplicates /blog, so it points its canonical at the clean URL
    canonicalPath () {
      return this.$route.params.page === '1' ? '/blog' : this.$route.path
    }
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
    return withPageNumber(setMeta(this.props, this.canonicalPath), this.$route.params.page)
  }
}
</script>
