<template lang="pug" src="./index.pug" ></template>

<script>
import { removeFocus } from '~/resources/mixins'
import BlockButton from '~/components/block/block-button'
import globalData from '~/data/globalData.json'

export default {
  components: {
    BlockButton
  },
  mixins: [removeFocus],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    jpgSrc: null,
    webpSrc: null,
    imageLoaded: false
  }),
  computed: {
    hasSecondaryButton () {
      return Boolean(this.props.secondary_button && this.props.secondary_button.label)
    },
    socialLinks () {
      if (this.props.content_block === 'social_block') {
        return globalData.footer.social_media
      }
      return this.props.social_links || []
    }
  },
  mounted () {
    if (this.props.background_type === 'has_image') {
      this.lazyLoad()
      this.$nextTick(() => {
        this.imageParallax()
      })
    }
    this.$nextTick(() => {
      this.contentAnimation()
    })
  },
  methods: {
    lazyLoad () {
      const section = document.querySelector('.block-banner')

      this.$gsap.to(this.$refs.theImage, {
        scrollTrigger: {
          trigger: section,
          start: '-50% bottom',
          onEnter: this.loadImage,
          once: true
        }
      })
    },
    loadImage () {
      const image = this.$refs.theImage
      if (this.props.image.webp) {
        this.webpSrc = this.props.image.webp
      }
      this.jpgSrc = this.props.image.src
      image.children[1].onload = () => {
        this.imageLoaded = true
      }
    },
    imageParallax () {
      const section = document.querySelector('.block-banner')
      const img = document.querySelector('.block-banner__background-image')

      this.$gsap.to('.block-banner__background-image', {
        y: +img.dataset.speed * section.clientHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom-=48 top',
          invalidateOnRefresh: true,
          scrub: true
        }
      })
    },
    contentAnimation () {
      /* eslint-disable */
      this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
      const blockTitle = this.$refs.blockTitle ? this.$refs.blockTitle : null
      const textBlock = this.$refs.textBlock ? this.$refs.textBlock : null
      const socialBlock = this.$refs.socialBlock ? this.$refs.socialBlock : null

      const titleSplit = new this.$SplitText(blockTitle, { type: 'lines' })

      const tl = this.$gsap.timeline({
        scrollTrigger: {
          trigger: this.$refs.blockContainer,
          start: 'top+=48 bottom'
        }
      })

      if (blockTitle !== null) {
        tl.from(titleSplit.lines, {
          y: '48',
          opacity: 0,
          duration: 1,
          stagger: 0.115,
          ease: 'customEaseOut'
        })
      }
      if (textBlock) {
        tl.from(textBlock, {
          opacity: 0,
          duration: 1,
          ease: 'customEaseOut'
        }, '<+=0.25')
      }
      if (socialBlock) {
        tl.from(socialBlock, {
          '--blockWidth': 0,
          duration: .5,
          ease: 'power3.out'
        }, '<+=0.25')
        tl.from(this.$refs.socialList, {
          opacity: 0,
          duration: 1,
          ease: 'customEaseOut'
        }, '<+=0.25')
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
