<template lang="pug" src="./index.pug"></template>

<script>
import { setJSONData } from '~/resources/utils'
import { absoluteUrl } from '~/resources/schema'

export default {
  transition: 'fade',
  async asyncData () {
    const props = await setJSONData('global', 'globalData')
    return { props }
  },
  head () {
    const title = `Thank You - ${this.props.company_name}`

    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: `Thank you for contacting ${this.props.company_name}. We will be in touch shortly.` },
        { hid: 'robots', name: 'robots', content: 'noindex, nofollow' },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:url', property: 'og:url', content: absoluteUrl(this.$route.path) }
      ],
      link: [
        { hid: 'canonical', rel: 'canonical', href: absoluteUrl(this.$route.path) }
      ]
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
