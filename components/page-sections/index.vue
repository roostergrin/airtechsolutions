<template lang='pug' src='./index.pug'></template>

<script>
import TheHero from '~/components/hero/hero-main'
import { buildSectionStyleVars } from '~/resources/theme-scheme'

const BlockAccordionFull = () => import('~/components/block/block-accordion-full')
const BlockBanner = () => import('~/components/block/block-banner')
const BlockBeforeAfterSlider = () => import('~/components/block/block-before-after-slider')
const BlockSmileGallery = () => import('~/components/block/block-smile-gallery')
const BlockContact = () => import('~/components/block/block-contact')
const BlockContactForm = () => import('~/components/block/block-contact-form')
const BlockGrid = () => import('~/components/block/block-grid')
const BlogPosts = () => import('~/components/block/block-repeater-post')
const BlockImage = () => import('~/components/block/block-image')
const BlockImageText = () => import('~/components/block/block-image-text')
const BlockItemRow = () => import('~/components/block/block-item-row')
const BlockLogoBanner = () => import('~/components/block/block-logo-banner')
const BlockMasonaryGrid = () => import('~/components/block/block-masonary-grid')
const BlockMultiTestimonial = () => import('~/components/block/block-multi-testimonial')
const BlockSingleImageSlider = () => import('~/components/block/block-single-image-slider')
const BlockSingleTestimonial = () => import('~/components/block/block-single-testimonial')
const BlockSingleVideoSlider = () => import('~/components/block/block-single-video-slider')
const BlockServiceNavigation = () => import('~/components/block/block-service-navigation')
const BlockTabs = () => import('~/components/block/block-tabs')
const BlockTextFH = () => import('~/components/block/block-text-fh')
const BlockTextSimple = () => import('~/components/block/block-text-simple')

const sectionBackgroundLabels = {
  bg1: 'bg-1',
  bg2: 'bg-2'
}

export default {
  transition: 'fade',
  components: {
    BlockAccordionFull,
    BlockBanner,
    BlockBeforeAfterSlider,
    BlockSmileGallery,
    BlockContact,
    BlockContactForm,
    BlockGrid,
    BlockImage,
    BlockImageText,
    BlockItemRow,
    BlockLogoBanner,
    BlockMasonaryGrid,
    BlockMultiTestimonial,
    BlockSingleImageSlider,
    BlockSingleTestimonial,
    BlockSingleVideoSlider,
    BlockServiceNavigation,
    BlockTabs,
    BlockTextFH,
    BlockTextSimple,
    BlogPosts,
    TheHero
  },
  props: {
    props: {
      type: Array,
      default: () => ([])
    },
    pageTitle: {
      type: String,
      default: () => ('')
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.$store.dispatch('VIEW_SITE', true)
      }, 100)
    })
  },
  methods: {
    sectionId (section, i) {
      return section.component_options && section.component_options.hash
        ? section.component_options.hash
        : `${section.acf_fc_layout}-${i}`
    },
    sectionKey (section, i) {
      return `${this.$route.path}::${this.sectionId(section, i)}`
    },
    sectionBackgroundLabel (section) {
      const hasBackground = (section.has_background || section.background_type === 'has_background') && section.background

      return hasBackground ? sectionBackgroundLabels[section.background] || null : null
    },
    sectionTitlesRole (section) {
      return section.acf_fc_layout === 'hero' ? 'titles-dark' : null
    },
    sectionStyle (section, i) {
      const theme = this.$store.state.theme

      if (!theme) {
        return {}
      }

      return buildSectionStyleVars(theme, this.sectionKey(section, i), this.sectionBackgroundLabel(section), this.sectionTitlesRole(section))
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
