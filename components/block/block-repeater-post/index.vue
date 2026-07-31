<template lang="pug" src="./index.pug"></template>

<script>
import { debounce, fadeUpIn } from '~/resources/mixins'
import BlockPagination from '~/components/block/block-post-pagination'
import BaseButtonCaret from '~/components/base/base-button-caret'
import BaseButtonSimple from '~/components/base/base-button-simple'
import BaseImage from '~/components/base/base-image'

export default {
  components: {
    BlockPagination,
    BaseButtonCaret,
    BaseButtonSimple,
    BaseImage
  },
  mixins: [debounce, fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    storeKey: {
      type: String,
      default: 'posts'
    },
    basePath: {
      type: String,
      default: '/blog'
    },
    postField: {
      type: String,
      default: 'blog_post'
    },
    buttonLabel: {
      type: String,
      default: 'Read More'
    }
  },
  data () {
    return {
      navHeight: '0px',
      paginatedGallery: [],
      page: 0,
      perPage: 5,
      shownGallery: [],
      elemMinHeight: 0
    }
  },
  computed: {
    postsData () {
      return this.$store.state[this.storeKey] || {}
    },
    // Computed rather than set in mounted() so the list is present in the
    // statically generated HTML — otherwise crawlers only ever see "Loading..."
    // and find no links to any article.
    havePosts () {
      return Boolean(this.postsData.posts)
    },
    currentPosts () {
      const page = this.$route.params.page || '1'
      return this.postsData.postsPerPage && this.postsData.postsPerPage[page] ? this.postsData.postsPerPage[page] : []
    },
    pageCount () {
      return Number(this.postsData.pageCount || 0)
    }
  },
  mounted () {
    this.handleResize()
    window.addEventListener('resize', this.debounceFunc)

    this.$store.dispatch('VIEW_SITE', true)
    this.handleAnimation()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  methods: {
    debounceFunc () {
      this.debounce(this.handleResize, null, 300)
    },
    handleResize () {
      this.getNavHeight()
      this.setMinHeight()
    },
    setMinHeight () {
      const footerHeight = document.querySelector('.footer').clientHeight
      const navHeight = document.querySelector('.navigation').clientHeight
      this.elemMinHeight = window.innerHeight - (footerHeight + navHeight)
    },
    getNavHeight () {
      this.$nextTick(() => {
        const navHeight = document.querySelector('.navigation').clientHeight
        this.navHeight = `${navHeight}px`
      })
    },
    handleAnimation () {
      this.$nextTick(() => {
        // const container = this.$refs.container
        if (this.props.header) {
          this.$_fadeUpIn(this.$refs.header, 24, 'top+=58')
        }
        if (this.currentPosts.length && this.$refs.posts) {
          this.$refs.posts.forEach((post, i) => {
            this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
            const posttl = this.$gsap.timeline({
              scrollTrigger: {
                trigger: post,
                start: '-50 bottom'
              }
            })
            posttl.from(post, {
              opacity: 0,
              y: 16,
              delay: 0.05,
              duration: 0.45,
              ease: 'customEaseOut'
            }, '<+=1')
          })
        }
      })
    },
    getPostContent (post) {
      return post && post.post && post.post[this.postField] ? post.post[this.postField] : {}
    },
    hasImage (image) {
      return image && image.src
    },
    getPostPath (post) {
      return post.path || `${this.basePath}/${post.slug}`
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
