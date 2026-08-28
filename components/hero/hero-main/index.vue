<template lang="pug" src="./index.pug"></template>

<script>
import BlockButton from '~/components/block/block-button'

export default {
  components: {
    BlockButton
  },
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    customizationSectionKey: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    videoPlaying: true,
    revealTimeout: null,
    serviceHighlightTimeout: null,
    options: {
      root: null,
      rootMargin: '0px',
      threshold: [ 0.01 ]
    }
  }),
  computed: {
    hasHeroLogo () {
      return Boolean(this.props.logo && this.props.logo.name)
    },
    hasServiceIcons () {
      return Boolean(this.serviceIcons.length)
    },
    isPropertyPage () {
      return /^\/services-for-/.test(this.$route.path)
    },
    isAboutPage () {
      return this.$route.path === '/about'
    },
    isMarketingPage () {
      return this.$route.path.replace(/\/$/, '') === '/marketing'
    },
    // Some hero entries repeat the JPEG in the `webp` field, which would emit a
    // <source type="image/webp"> the browser cannot use as advertised.
    webpSrcset () {
      const webp = (this.props.image && this.props.image.webp) || ''
      return /\.webp(\?|$)/i.test(webp) ? webp : null
    },
    serviceIcons () {
      if (!this.props.service_icons || !this.props.service_icons.length) {
        return []
      }

      return this.props.service_icons.map(service => ({
        ...service,
        src: require(`~/assets/service-icons/${service.icon}`)
      }))
    }
  },
  mounted () {
    // The hero markup is server-rendered, so the copy is already on screen.
    // Animating it straight away avoids a flash of static text while the hero
    // media loads, and the media only gates the store's loaded flag.
    this.handleAnimation()

    if (this.$refs.image) {
      this.watchImage()
    }
    if (this.$refs.video) {
      this.$refs.video.addEventListener('loadeddata', this.markSiteLoaded, { once: true })
    }
    if (!this.$refs.video && !this.$refs.image) {
      this.markSiteLoaded()
    }
  },
  beforeDestroy () {
    window.clearTimeout(this.serviceHighlightTimeout)
    window.clearTimeout(this.revealTimeout)
  },
  methods: {
    // The hero <img> is server-rendered with its src so it can start downloading
    // before hydration, which means it may already be decoded by the time we
    // mount. Checking `complete` first keeps us from waiting on a `load` event
    // that will never fire.
    watchImage () {
      const image = this.$refs.image.querySelector('img')

      if (!image || image.complete) {
        this.markSiteLoaded()
        return
      }

      image.addEventListener('load', this.markSiteLoaded, { once: true })
      image.addEventListener('error', this.markSiteLoaded, { once: true })
      // A hero image that never resolves should not leave the flag unset.
      this.revealTimeout = window.setTimeout(this.markSiteLoaded, 3000)
    },
    markSiteLoaded () {
      window.clearTimeout(this.revealTimeout)

      if (!this.$store.state.siteLoaded) {
        this.$store.dispatch('VIEW_SITE', true)
      }
    },
    playVideo () {
      this.$refs.video.play()
      this.videoPlaying = true
    },
    pauseVideo () {
      this.$refs.video.pause()
      this.videoPlaying = false
    },
    handleCtaClick () {
      // Navigate to contact page with form hash
      if (this.props.button.path && this.props.button.hash) {
        this.$router.push(this.props.button.path + this.props.button.hash)
      } else if (this.props.button.path) {
        this.$router.push(this.props.button.path)
      }
    },
    handleServiceIconClick (service) {
      if (!service.service_key) {
        return
      }

      const highlightClass = 'block-item-row__item--is-highlighted'
      const target = document.querySelector(`[data-service-key="${service.service_key}"]`)

      if (!target) {
        return
      }

      document.querySelectorAll(`.${highlightClass}`).forEach(item => item.classList.remove(highlightClass))
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })

      window.requestAnimationFrame(() => {
        target.classList.add(highlightClass)
      })

      window.clearTimeout(this.serviceHighlightTimeout)
      this.serviceHighlightTimeout = window.setTimeout(() => {
        target.classList.remove(highlightClass)
      }, 7000)
    },
    handleAnimation (delay) {
      this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
      const tl = this.$gsap.timeline()
      const heroTitle = this.$refs.heroTitle
      const heroText = this.$refs.heroText
      const heroBtn = this.$refs.heroBtn

      /* eslint-disable */
      if (this.hasHeroLogo) {
        tl.from(heroTitle, {
          y: '32',
          opacity: 0,
          duration: 1.25,
          delay: 0.25,
          ease: 'customEaseOut'
        })
      } else {
        const titleSplit = new this.$SplitText(heroTitle, { type: 'lines' })

        tl.from(titleSplit.lines, {
          y: '32',
          opacity: 0,
          duration: 1.25,
          stagger: 0.115,
          delay: 0.25,
          ease: 'customEaseOut'
        })
      }
      if (heroText) {
        tl.from(heroText, {
          y: '24',
          opacity: 0,
          duration: 1,
          ease: 'customEaseOut'
        }, '<+=0.175')
      }
      if (heroBtn) {
        tl.from('.hero-main__cta', {
          y: '24',
          opacity: 0,
          duration: 1,
          ease: 'customEaseOut'
        }, '<+=0.175')
      }
      if (this.hasServiceIcons) {
        tl.from('.hero-main__service-icons', {
          y: '24',
          opacity: 0,
          duration: 0.85,
          ease: 'customEaseOut'
        }, '<+=0.2')
      } else if (this.$route.path === '/') {
        tl.from('.hero-main__down', {
          opacity: 0,
          duration: 0.6,
          ease: 'ease'
        })
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
