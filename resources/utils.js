import axios from 'axios'
import { api, url } from './api'
import {
  absoluteUrl,
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  serviceSchema,
  socialImage
} from './schema'

const emptyPageData = (slug = '') => ({
  title: slug,
  slug,
  sections: [],
  meta: {}
})

const emptyPostsData = () => ({
  posts: [],
  postsPerPage: { '1': [] },
  pageCount: 0
})

const responseArray = (response, label) => {
  if (response && Array.isArray(response.data)) {
    return response.data
  }

  console.warn(`${label}: expected array response`)
  return []
}

const totalPages = (response) => {
  const pages = Number(response && response.headers && response.headers['x-wp-totalpages'])
  return Number.isFinite(pages) ? pages : 0
}

const getLocalPosts = (customPostType = 'posts') => {
  try {
    if (customPostType === 'service-guides') {
      return require('../data/service-guides.json')
    }

    return require('../data/posts.json')
  } catch (e) {
    return []
  }
}

const getPostBasePath = customPostType => customPostType === 'posts' ? 'blog' : customPostType

const mapPost = (item, customPostType = 'posts') => ({
  id: item.id,
  title: item.title,
  path: `/${getPostBasePath(customPostType)}/${item.slug}`,
  slug: item.slug,
  category: item.categories ? item.categories[0] : null,
  date: item.date,
  post: item.acf
})

const buildPostsData = (posts, total = 100, customPostType = 'posts') => {
  const perPage = Math.max(Number(total) || 100, 1)
  const sortedDataArr = posts.map(post => mapPost(post, customPostType)).sort((a, b) => {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    return bDate - aDate
  })
  const currentPosts = {}
  sortedDataArr.forEach((post, index) => {
    const page = `${Math.floor(index / perPage) + 1}`
    if (!currentPosts[page]) {
      currentPosts[page] = []
    }
    currentPosts[page].push(post)
  })

  return {
    posts: sortedDataArr,
    postsPerPage: currentPosts,
    pageCount: Math.ceil(sortedDataArr.length / perPage)
  }
}

// gets data for all forms
export const getForms = () => {
  try {
    return require('../data/forms.json')
  } catch (e) {
    console.warn(`ERROR loading local forms data: ${e}`)
    return []
  }
}

// gets data for all custom posts of a specific type
export const getCustomPosts = async (customPostType, total = 100) => {
  if (customPostType === 'posts' || customPostType === 'service-guides') {
    const localPosts = getLocalPosts(customPostType)
    if (localPosts.length) {
      return buildPostsData(localPosts, total, customPostType)
    }
  }

  try {
    const response = await axios.get(
      `${api}/wp/v2/${customPostType}?per_page=${total}`
    )
    const dataPages = totalPages(response)
    let dataArray = responseArray(response, `ERROR getting ${customPostType} posts`).map(item => ({
      id: item.id,
      title: item.title,
      path: `/${customPostType === 'posts' ? 'blog' : customPostType}/${item.slug}`,
      slug: item.slug,
      category: item.categories ? item.categories[0] : null,
      date: item.date,
      post: item.acf
    }))
    const currentPosts = { '1': dataArray }
    for (let i = 2; i <= dataPages; i++) {
      const nextPage = await axios.get(
        `${api}/wp/v2/${customPostType}?per_page=${total}&page=${i}`
      )
      const next = responseArray(nextPage, `ERROR getting ${customPostType} posts`).map(item => ({
        id: item.id,
        title: item.title.rendered,
        path: `/${customPostType === 'posts' ? 'blog' : customPostType}/${item.slug}`,
        slug: item.slug,
        category: item.categories ? item.categories[0] : null,
        date: item.date,
        post: item.acf
      }))
      dataArray = [...dataArray, ...next]
      currentPosts[`${i}`] = next
    }
    const sortedDataArr = dataArray.sort((a, b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      return bDate - aDate
    })

    const data = {
      posts: sortedDataArr,
      postsPerPage: currentPosts,
      pageCount: dataPages
    }
    return data
  } catch (e) {
    console.warn(`ERROR getting ${customPostType} posts: ${e}`)
    return emptyPostsData()
  }
}

export const getThemeJSON = () => {
  return require('../data/theme.json')
}

export const setJSONData = (slug, customPostType = 'pages') => {
  try {
    const normalizedSlug = slug.toLowerCase()
    // Using require ensures data is included at build time for static generation
    const jsonData = require(`../data/${customPostType}.json`)
    if (slug === 'global') {
      return jsonData
    }

    // Get the pages data - pages.json has { pages: {...}, sitemap_metadata: {...} }
    const pagesData = jsonData.pages || jsonData

    // Get the data array for this slug - make it case insensitive
    const pageKey = Object.keys(pagesData).find(key => key.toLowerCase() === normalizedSlug)
    const slugData = pagesData[slug] || pagesData[normalizedSlug] || pagesData[pageKey]
    let seoData = {}
    let pageSections = []

    if (!slugData) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`No item found with slug: ${slug} in ${customPostType}.json`)
      }
      return emptyPageData(slug)
    }

    // If slugData is an array, process it
    if (Array.isArray(slugData)) {
      // Extract SEO object from the array if it exists
      pageSections = slugData.filter(item => item && !item.seo)
      const seoItem = slugData.find(item => item && item.seo)
      if (seoItem) {
        seoData = seoItem
      }
    } else {
      // If not an array, use as is
      pageSections = Array.isArray(slugData.sections) ? slugData.sections : []
      seoData = slugData.meta || {}
    }

    const item = {
      title: slug,
      slug: normalizedSlug === 'home' ? '' : normalizedSlug.replace(/^\/+/, ''),
      sections: pageSections,
      meta: seoData
    }

    return item
  } catch (error) {
    console.warn(`Error loading data for ${slug}:`, error.message)
    return emptyPageData(slug)
  }
}

export const setData = async (slug, customPostType = 'pages') => {
  if (customPostType === 'posts' || customPostType === 'service-guides') {
    const localPost = getLocalPosts(customPostType).find(post => post.slug === slug)
    if (localPost) {
      return {
        title: localPost.title.rendered,
        slug: localPost.slug,
        // Kept alongside the ACF payload so Article schema has an ISO publish date
        date: localPost.date,
        ...localPost.acf
      }
    }
  }

  if (customPostType === 'pages') {
    const localPage = setJSONData(slug)
    if (localPage.sections.length || Object.keys(localPage.meta || {}).length) {
      return localPage
    }
  }

  try {
    const response = await axios.get(
      `${api}/wp/v2/${customPostType}?slug=${slug}`
    )

    const dataArray = responseArray(response, `${slug} page`)
    if (!dataArray.length) {
      return emptyPageData(slug)
    }

    const data = {
      title: dataArray[0].title.rendered,
      slug: dataArray[0].slug,
      date: dataArray[0].date,
      ...dataArray[0].acf
    }
    return { ...data }
  } catch (e) {
    console.warn(`${slug} page: ${e}`)
    return emptyPageData(slug)
  }
}

// Pages 2+ of a listing share the index page's SEO data, so the page number is
// appended to keep their titles and descriptions distinct.
export const withPageNumber = (head, page) => {
  const pageNumber = Number(page || 1)

  if (pageNumber < 2) {
    return head
  }

  return {
    ...head,
    title: `${head.title} - Page ${pageNumber}`,
    meta: head.meta.map(tag => (tag.hid === 'description' || tag.hid === 'og:description'
      ? { ...tag, content: `${tag.content} Page ${pageNumber}.` }
      : tag))
  }
}

const servicePagePattern = /^\/(commercial-|professional-commercial-|services-for-)/

// Page-specific JSON-LD. Organization and WebSite are emitted site-wide from
// config/head.config.js, so everything here references them by @id.
const pageJsonLd = (path, pageMeta, seoData) => {
  const scripts = []
  const post = pageMeta.blog_post
  const heroTitle = (pageMeta.sections || []).find(section => section && section.title)
  const pageName = post
    ? post.title || pageMeta.title
    : (heroTitle && heroTitle.title) || seoData.page_title || pageMeta.title

  if (post) {
    const isGuide = path.startsWith('/service-guides/')

    scripts.push(jsonLdScript('ld-page', articleSchema({
      title: post.title || pageMeta.title,
      description: seoData.page_description || post.excerpt,
      path,
      image: post.main_image && post.main_image.src,
      datePublished: pageMeta.date,
      type: isGuide ? 'Article' : 'BlogPosting'
    })))
  } else if (path === '/faq') {
    const accordion = (pageMeta.sections || []).find(section => section && section.acf_fc_layout === 'accordion')
    const faq = accordion && faqSchema(accordion.accordion)

    if (faq) {
      scripts.push(jsonLdScript('ld-page', faq))
    }
  } else if (servicePagePattern.test(path)) {
    scripts.push(jsonLdScript('ld-page', serviceSchema({
      name: pageName,
      description: seoData.page_description,
      path,
      image: heroTitle && heroTitle.image && heroTitle.image.src
    })))

    const accordion = (pageMeta.sections || []).find(section => section && section.acf_fc_layout === 'accordion')
    const faq = accordion && faqSchema(accordion.accordion)

    if (faq) {
      scripts.push(jsonLdScript('ld-faq', faq))
    }
  }

  const breadcrumbs = breadcrumbSchema(path, pageName)

  if (breadcrumbs) {
    scripts.push(jsonLdScript('ld-breadcrumbs', breadcrumbs))
  }

  return scripts
}

export const setMeta = (meta, path, options = {}) => {
  const pageMeta = meta || emptyPageData()
  // Get the SEO data from either meta.seo or meta.meta.seo
  const seoData = pageMeta.seo || (pageMeta.meta && pageMeta.meta.seo) || {}
  // Prefer the live route: a post's slug has no `/blog` or `/service-guides`
  // prefix, so deriving the canonical from it points at a URL that doesn't exist.
  const canonicalPath = path || `/${pageMeta.slug || ''}`
  const canonical = path ? absoluteUrl(path) : `${url}${pageMeta.slug || ''}`
  const scripts = options.noindex ? [] : pageJsonLd(canonicalPath, pageMeta, seoData)

  return {
    title: seoData.page_title ? seoData.page_title : pageMeta.title,
    meta: [
      options.noindex && { hid: 'robots', name: 'robots', content: 'noindex, nofollow' },
      seoData.page_description && { hid: 'description', name: 'description', content: seoData.page_description },
      seoData.page_keywords && { hid: 'keywords', name: 'keywords', content: seoData.page_keywords },
      // // OG Meta
      { hid: 'og:type', property: 'og:type', content: pageMeta.blog_post ? 'article' : 'website' },
      seoData.page_title && { hid: 'og:title', property: 'og:title', content: seoData.social_meta?.og_meta?.title ? seoData.social_meta.og_meta.title : seoData.page_title },
      seoData.page_description && { hid: 'og:description', property: 'og:description', content: seoData.social_meta?.og_meta?.description ? seoData.social_meta.og_meta.description : seoData.page_description },
      seoData.social_meta?.og_meta?.image && { hid: 'og:image', property: 'og:image', content: socialImage(seoData.social_meta.og_meta.image) },
      { hid: 'og:url', property: 'og:url', content: canonical }
    ].filter(Boolean),
    link: [
      { hid: 'canonical', rel: 'canonical', href: canonical }
    ],
    script: scripts,
    __dangerouslyDisableSanitizersByTagID: scripts.reduce((tags, script) => {
      tags[script.hid] = ['innerHTML']
      return tags
    }, {})
  }
}
