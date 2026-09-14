import locationPages from '../data/location-pages.json'

export const locationImage = (image, category = 'Areas We Serve') => ({
  ...image,
  aria_hidden: false,
  bgColor: '',
  imageBackground: false,
  addLoader: false,
  objectPosition: 'center',
  forceAlt: '',
  loading_mask: '',
  image_selection_hints: { context_category: category }
})

const componentOptions = hash => ({
  hash,
  component_padding: 'half',
  component_margins: 'none',
  hide_component: false
})

const textSection = section => ({
  acf_fc_layout: 'block_text_simple',
  title: section.title,
  paragraphs: [{ text: section.text }],
  component_options: componentOptions(section.hash),
  large_title: false,
  center_title: false,
  one_column: true,
  add_texture: false,
  background: '',
  linear_gradient: ''
})

const imageTextSection = (section, image, reverse) => ({
  acf_fc_layout: 'image_text',
  title: section.title,
  paragraphs: [{ has_heading: false, heading: '', text: section.text }],
  accordion: [],
  image: locationImage(image, section.title),
  video: { type: 'embedded', src: '' },
  buttons: [],
  component_options: componentOptions(section.hash),
  reverse,
  has_buttons: false,
  has_accordion: false,
  is_dynamic: false,
  use_video: false,
  large_image: false,
  has_background: false,
  background: 'bg1',
  linear_gradient: '',
  add_texture: false,
  large_title: false,
  title_color: 'text',
  title_underline_color: 'none'
})

export const setLocationPage = (slug) => {
  const page = locationPages[slug]

  if (!page) {
    return { title: slug, slug, sections: [], meta: {} }
  }

  return {
    title: page.title,
    slug,
    sections: [
      {
        acf_fc_layout: 'hero',
        title: page.title,
        text: page.intro,
        button: {
          type: 'nuxt',
          style: 'primary',
          label: 'Schedule Now',
          aria_label: `Schedule service for a ${page.name} property`,
          href: '',
          path: '/contact',
          hash: '',
          external: false,
          include_icon: false,
          icon: '',
          color: 'primary'
        },
        media_type: 'image',
        image: locationImage(page.images.hero, `${page.name} commercial services`),
        video: { src: '', webm: '', title: '' },
        small: false
      },
      imageTextSection(page.sections[0], page.images.sections[0], false),
      textSection(page.sections[1]),
      imageTextSection(page.sections[2], page.images.sections[1], true),
      {
        acf_fc_layout: 'multi_use_banner',
        title: page.cta,
        content_block: 'text_block',
        text: '',
        social_links: [],
        email: '',
        button: {
          type: 'nuxt',
          style: 'primary',
          label: 'Schedule Now',
          aria_label: `Schedule service for a ${page.name} property`,
          href: '',
          path: '/contact',
          hash: '',
          external: false,
          include_icon: false,
          icon: '',
          color: ''
        },
        component_options: componentOptions('schedule-service'),
        background_type: 'has_background',
        background: 'bg2',
        add_texture: false,
        linear_gradient: '',
        image: { src: '', webp: '', alt: '', aria_hidden: true },
        reversed: false,
        centered: true,
        large_title: true,
        text_color: 'primary'
      }
    ],
    meta: { seo: page.seo }
  }
}
