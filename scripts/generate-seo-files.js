/**
 * Generates the crawler-facing files that live alongside the sitemap:
 *
 *   static/urllist.txt  plain list of every indexable URL
 *   static/llms.txt     structured site summary for AI-assisted search
 *   static/rss.xml      RSS 2.0 feed of blog posts
 *
 * They are derived from data/pages.json, data/posts.json and
 * data/service-guides.json so they stay in step with the sitemap instead of
 * drifting as content is added. Run as part of build/generate.
 */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const STATIC_DIR = path.join(ROOT, 'static')
const SITE_URL = 'https://www.airtechsolutions.com'

// Routes with a page component but no data/pages.json entry.
const EXTRA_PAGE_ROUTES = ['/accessibility', '/privacy-policy']

// Utility pages that exist but should never be advertised to crawlers.
const EXCLUDED_ROUTES = ['/thank-you', '/404', '/marketing']

const readJSON = (fileName, fallback) => {
  const filePath = path.join(ROOT, 'data', fileName)
  if (!fs.existsSync(filePath)) {
    return fallback
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    console.warn(`generate-seo-files: could not read data/${fileName}: ${e.message}`)
    return fallback
  }
}

const escapeXML = value => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const stripTags = value => String(value == null ? '' : value).replace(/<[^>]*>/g, '').trim()

const absolute = route => `${SITE_URL}${route === '/' ? '/' : route}`

// Mirrors getLocalPageRoutes() in config/seo.config.js.
const pageRoutes = () => {
  const pages = readJSON('pages.json', {})
  const pagesData = pages.pages || pages

  return Object.keys(pagesData).map(name =>
    name === 'Home' ? '/' : '/' + name.toLowerCase().replace(/\s+/g, '-'))
}

const entryTitle = (entry) => {
  const acf = (entry.acf && entry.acf.blog_post) || {}
  const rendered = entry.title && entry.title.rendered
  return stripTags(acf.title || rendered || entry.slug)
}

const entryExcerpt = (entry) => {
  const acf = (entry.acf && entry.acf.blog_post) || {}
  return stripTags(acf.excerpt || '')
}

const entryDate = entry => entry.modified || entry.date || null

// Content timestamps are stored WordPress-style with no timezone, which
// Date parses as machine-local. Pinning them to UTC keeps the feed byte
// identical whether it is built on a laptop or on the UTC build server.
const parseDate = (value) => {
  if (!value) {
    return null
  }

  const raw = String(value)
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw) ? `${raw}Z` : raw
  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const collect = () => {
  const posts = readJSON('posts.json', [])
  const guides = readJSON('service-guides.json', [])

  const routes = [
    ...pageRoutes(),
    ...EXTRA_PAGE_ROUTES,
    ...posts.map(post => `/blog/${post.slug}`),
    ...guides.map(guide => `/service-guides/${guide.slug}`)
  ].filter(route => !EXCLUDED_ROUTES.includes(route))

  return {
    posts,
    guides,
    // Object key order dedupes while keeping the first occurrence.
    routes: Object.keys(routes.reduce((seen, route) => ({ ...seen, [route]: true }), {}))
  }
}

const writeUrlList = (routes) => {
  const body = routes.map(absolute).join('\n') + '\n'
  fs.writeFileSync(path.join(STATIC_DIR, 'urllist.txt'), body)
  return routes.length
}

const writeRSS = (posts) => {
  const items = posts
    .slice()
    .sort((a, b) => (parseDate(entryDate(b)) || 0) - (parseDate(entryDate(a)) || 0))
    .map((post) => {
      const link = absolute(`/blog/${post.slug}`)
      const published = parseDate(entryDate(post))
      const pubDate = published ? published.toUTCString() : null

      return [
        '    <item>',
        `      <title>${escapeXML(entryTitle(post))}</title>`,
        `      <link>${escapeXML(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXML(link)}</guid>`,
        pubDate ? `      <pubDate>${escapeXML(pubDate)}</pubDate>` : null,
        `      <description>${escapeXML(entryExcerpt(post))}</description>`,
        '    </item>'
      ].filter(Boolean).join('\n')
    })

  const latest = posts.reduce((newest, post) => {
    const published = parseDate(entryDate(post))
    if (!published) {
      return newest
    }
    return !newest || published > newest ? published : newest
  }, null)

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Air Tech Solutions Blog</title>',
    `    <link>${SITE_URL}/blog</link>`,
    '    <description>Commercial exterior cleaning, ventilation, and air quality insight for New England property managers.</description>',
    '    <language>en-us</language>',
    latest ? `    <lastBuildDate>${escapeXML(latest.toUTCString())}</lastBuildDate>` : null,
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    ''
  ].filter(Boolean).join('\n')

  fs.writeFileSync(path.join(STATIC_DIR, 'rss.xml'), feed)
  return items.length
}

const writeLLMs = ({ posts, guides }) => {
  const pages = readJSON('pages.json', {})
  const pagesData = pages.pages || pages

  const descriptionFor = (key) => {
    const blocks = pagesData[key]
    if (!Array.isArray(blocks)) {
      return ''
    }
    const seoBlock = blocks.find(block => block && block.seo)
    return seoBlock ? stripTags(seoBlock.seo.page_description || '') : ''
  }

  const titleFor = (key) => {
    const blocks = pagesData[key]
    if (!Array.isArray(blocks)) {
      return key
    }
    const seoBlock = blocks.find(block => block && block.seo)
    if (seoBlock && seoBlock.seo.page_title) {
      return stripTags(seoBlock.seo.page_title)
    }
    const hero = blocks.find(block => block && block.acf_fc_layout === 'hero')
    return stripTags((hero && hero.title) || key)
  }

  const routeFor = key => key === 'Home' ? '/' : '/' + key.toLowerCase().replace(/\s+/g, '-')

  const keys = Object.keys(pagesData).filter(key => !EXCLUDED_ROUTES.includes(routeFor(key)))
  const isService = key => key.startsWith('commercial-') || key.startsWith('professional-commercial-')
  const isProperty = key => key.startsWith('services-for-')
  const isCore = key => !isService(key) && !isProperty(key)

  const link = (title, route, description) => {
    const suffix = description ? `: ${description}` : ''
    return `- [${title}](${absolute(route)})${suffix}`
  }

  const pageLinks = filter => keys.filter(filter)
    .map(key => link(titleFor(key), routeFor(key), descriptionFor(key)))

  const contentLinks = (entries, basePath) => entries.map(entry =>
    link(entryTitle(entry), `${basePath}/${entry.slug}`, entryExcerpt(entry)))

  const body = [
    '# Air Tech Solutions',
    '',
    '> Air Tech Solutions provides commercial exterior cleaning, ventilation, and indoor air quality services for commercial properties across New England, with a specialty in multi-family communities. Based in West Newton, MA and serving Greater Boston and surrounding areas.',
    '',
    'Air Tech Solutions works with commercial properties only. Services are quoted per property after scoping, because access, building materials, and condition all affect the approach.',
    '',
    '## Core pages',
    '',
    ...pageLinks(isCore),
    ...EXTRA_PAGE_ROUTES.map(route => link(
      route.replace('/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      route,
      '')),
    '',
    '## Services',
    '',
    ...pageLinks(isService),
    '',
    '## Property types served',
    '',
    ...pageLinks(isProperty),
    '',
    '## Service guides',
    '',
    ...contentLinks(guides, '/service-guides'),
    '',
    '## Blog',
    '',
    ...contentLinks(posts, '/blog'),
    '',
    '## Optional',
    '',
    `- [Sitemap](${SITE_URL}/sitemap.xml): full machine-readable index of every page`,
    `- [URL list](${SITE_URL}/urllist.txt): plain-text list of every indexable URL`,
    `- [RSS feed](${SITE_URL}/rss.xml): blog post feed`,
    ''
  ].join('\n')

  fs.writeFileSync(path.join(STATIC_DIR, 'llms.txt'), body)
}

const run = () => {
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true })
  }

  const content = collect()
  const urlCount = writeUrlList(content.routes)
  const itemCount = writeRSS(content.posts)
  writeLLMs(content)

  console.log(`generate-seo-files: urllist.txt (${urlCount} urls), rss.xml (${itemCount} items), llms.txt`)
}

run()
