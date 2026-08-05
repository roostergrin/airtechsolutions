<template lang="pug" src="./_slug.pug"></template>

<script>
import { setMeta, setData } from '~/resources/utils'
import BlockPost from '~/components/block/block-post'

export default {
  components: {
    BlockPost
  },
  async asyncData ({ params }) {
    const data = await setData(params.slug, 'service-guides')

    return { props: data }
  },
  head () {
    return setMeta(this.props, this.$route.path)
  }
}
</script>
