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
    return setMeta(
      Object.assign({}, this.props, { seo: (Object.assign({}, this.props.seo, { page_title: this.props.title })) }),
      this.$route.path
    )
  }
}
</script>
