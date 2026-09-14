import areasPage from '../data/areas-we-serve.json'
import locationPages from '../data/location-pages.json'
import { locationImage } from './location-pages'

const componentOptions = hash => ({
  hash,
  component_padding: 'half',
  component_margins: 'none',
  hide_component: false
})

const emptyButton = {
  type: 'nuxt',
  style: 'secondary',
  label: '',
  aria_label: '',
  href: '',
  path: '',
  hash: '',
  external: false,
  include_icon: false,
  icon: '',
  color: ''
}

const locationItem = ([slug, page]) => ({
  title: page.name,
  text: `Commercial exterior cleaning, ventilation, and air quality services for properties throughout ${page.name}.`,
  image: locationImage(page.images.hero, `${page.name} service area`),
  add_button: true,
  button: {
    button_type: 'nuxt_link',
    path: `/${slug}`,
    hash: '',
    href: '',
    label: `View ${page.name}`,
    aria: `View commercial property services in ${page.name}`
  }
})

export const setAreasWeServePage = () => ({
  title: areasPage.title,
  slug: 'areas-we-serve',
  sections: [
    {
      acf_fc_layout: 'hero',
      title: areasPage.title,
      text: areasPage.intro,
      button: {
        type: 'nuxt',
        style: 'primary',
        label: 'Schedule Now',
        aria_label: 'Schedule commercial property service with Air Tech Solutions',
        href: '',
        path: '/contact',
        hash: '',
        external: false,
        include_icon: false,
        icon: '',
        color: 'primary'
      },
      media_type: 'image',
      image: locationImage(areasPage.hero, 'Areas We Serve'),
      video: { src: '', webm: '', title: '' },
      small: false
    },
    {
      acf_fc_layout: 'multi_item_row',
      title: 'Commercial Cleaning Across New England',
      variant: '',
      items: Object.entries(locationPages).map(locationItem),
      button: emptyButton,
      component_options: componentOptions('locations'),
      media_type: 'image',
      linear_gradient: '',
      add_cta: false,
      left_aligned: false,
      large_title: true,
      alt_color: false
    },
    {
      acf_fc_layout: 'multi_use_banner',
      title: 'Ready to schedule service for your property?',
      content_block: 'text_block',
      text: '',
      social_links: [],
      email: '',
      button: {
        type: 'nuxt',
        style: 'primary',
        label: 'Schedule Now',
        aria_label: 'Schedule commercial property service with Air Tech Solutions',
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
  meta: { seo: areasPage.seo }
})
