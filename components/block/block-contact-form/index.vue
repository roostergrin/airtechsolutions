<template lang="pug" src="./index.pug" ></template>

<script>
import FormFlexible from '~/components/form/form-flexible'

export default {
  components: {
    FormFlexible
  },
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    selectedForm: null
  }),
  computed: {
    storeForms () {
      return this.$store.state.forms
    },
    successRedirect () {
      return this.$route.path.replace(/\/$/, '') === '/contact' ? '/thank-you/' : ''
    },
    formHeading () {
      const header = this.selectedForm?.content?.content?.header || ''
      if (this.props.title) {
        return this.props.title
      }
      if (header.toLowerCase().includes('we want to hear from you')) {
        return 'Get a Quote!'
      }
      return header
    }
  },
  watch: {
    storeForms: {
      immediate: true,
      handler (forms) {
        if (forms && forms.length) {
          this.selectedForm = forms.find(form => form.id.toString() === this.props.form[0].toString())
        }
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>
