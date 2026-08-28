<template lang='pug' src='./index.pug'></template>

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
    const props = setJSONData('marketing')
    return { props }
  },
  head () {
    // Paid-traffic landing page: kept out of the index so it never competes
    // with /contact or the service pages in organic search.
    return setMeta(this.props, this.$route.path, { noindex: true })
  }
}
</script>
