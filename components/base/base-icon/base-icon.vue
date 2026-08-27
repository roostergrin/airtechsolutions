<template lang='pug' src='./base-icon.pug'></template>

<script>
const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// The same SVG can be inlined several times in one document (the logo appears in
// the nav, the hero, and the footer), which would emit duplicate ids and fail
// W3C validation. Suffixing every declared id — and the references to it — keeps
// each copy self-contained and unique.
const scopeSvgIds = (svg, suffix) => {
  const ids = (svg.match(/\sid="([^"]+)"/g) || [])
    .map(match => match.replace(/\sid="|"$/g, ''))

  return ids.reduce((markup, id) => {
    const escaped = escapeForRegExp(id)
    return markup
      .replace(new RegExp(`(\\sid=")${escaped}(")`, 'g'), `$1${id}-${suffix}$2`)
      .replace(new RegExp(`(url\\(#)${escaped}(\\))`, 'g'), `$1${id}-${suffix}$2`)
      .replace(new RegExp(`((?:xlink:)?href="#)${escaped}(")`, 'g'), `$1${id}-${suffix}$2`)
  }, svg)
}

export default {
  props: {
    name: {
      type: String,
      default: () => ``
    }
  },
  computed: {
    svg () {
      let markup = null

      try {
        markup = require(`@/assets/icons/${this.name}.svg`)
      } catch (error) {
        try {
          markup = require(`@/assets/dental-icons/${this.name}.svg`)
        } catch (error2) {
          console.warn(`Icon "${this.name}" not found in assets/icons/ or assets/dental-icons/`)
          return null
        }
      }

      return scopeSvgIds(String(markup), `ats${this._uid}`)
    }
  }
}
</script>

<style lang="sass" src="./base-icon.sass"></style>
