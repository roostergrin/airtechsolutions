import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { api, url } from '../resources/api'

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

const getLocalContent = (fileName) => {
  const contentFile = path.join(process.cwd(), 'data', fileName)
  if (!fs.existsSync(contentFile)) {
    return []
  }

  try {
    return JSON.parse(fs.readFileSync(contentFile, 'utf8'))
  } catch (e) {
    console.warn(`SITEMAP LOCAL ${fileName}: ` + e)
    return []
  }
}

const getLocalPageRoutes = () => {
  const pages = getLocalContent('pages.json')
  const pagesData = pages.pages || pages

  return Object.keys(pagesData).map((pageName) => {
    if (pageName === 'Home') {
      return '/'
    }

    return '/' + pageName.toLowerCase().replace(/\s+/g, '-')
  })
}

const lastmodOf = item => (item && item.modified) || (item && item.date) || undefined

// Page 1 is skipped: it duplicates the clean /:basePath URL, which is already
// listed in sitemap-pages.xml and is what page/1 canonicalizes to.
const getPaginatedRoutes = (content, basePath, postsPerPage = 5) => {
  const routes = []
  const pageCount = Math.ceil(content.length / postsPerPage)

  for (let i = 2; i <= pageCount; i++) {
    routes.push({ url: `/${basePath}/page/` + i, changefreq: 'weekly', priority: 0.3 })
  }
  content.forEach(item => routes.push({
    url: `/${basePath}/` + item.slug,
    lastmod: lastmodOf(item),
    changefreq: 'monthly',
    priority: 0.7
  }))

  return routes
}

export const siteMap = {
  path: '/sitemap.xml',
  hostname: url,
  gzip: true,
  sitemaps: [
    {
      path: '/sitemap-pages.xml',
      defaults: {
        changefreq: 'daily',
        priority: 0.9
      },
      exclude: ['/**'],
      routes: () => getLocalPageRoutes().map(route => ({
        url: route,
        priority: route === '/' ? 1 : 0.9
      }))
    },
    {
      path: '/blog/sitemap-blog.xml',
      defaults: {
        changefreq: 'monthly',
        priority: 0.7
      },
      exclude: ['/**'],
      routes: async () => {
        const localPosts = getLocalContent('posts.json')
        if (localPosts.length) {
          return getPaginatedRoutes(localPosts, 'blog')
        }

        try {
          // Get All Blog Posts
          const response = await axios.get(`${api}/wp/v2/posts?per_page=100`)
          const dataPages = totalPages(response)
          const routes = []
          let blogArray = responseArray(response, 'SITEMAP BLOG API')
          for (let i = 2; i <= dataPages; i++) {
            const nextPage = await axios.get(
              `${api}/wp/v2/posts?per_page=100&page=${i}`
            )
            blogArray = [...blogArray, ...responseArray(nextPage, 'SITEMAP BLOG API')]
            routes.push({ url: '/blog/page/' + i, changefreq: 'weekly', priority: 0.3 })
          }
          blogArray.forEach((post) => {
            routes.push({ url: '/blog/' + post.slug, lastmod: lastmodOf(post) })
          })
          return routes
        } catch (e) {
          console.warn('SITEMAP BLOG API: ' + e)
          return []
        }
      }
    },
    {
      path: '/service-guides/sitemap-service-guides.xml',
      defaults: {
        changefreq: 'monthly',
        priority: 0.7
      },
      exclude: ['/**'],
      routes: () => {
        const guides = getLocalContent('service-guides.json')
        return getPaginatedRoutes(guides, 'service-guides')
      }
    }
  ]
}

export const setRobots = {
  UserAgent: '*',
  Disallow: '',
  Sitemap: url + 'sitemap.xml'
}
