import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { api } from '../resources/api'
import { setJSONData } from '../resources/utils'
import { siteHead } from './head.config.js'
import buildConfig from './build.config.js'
import { siteMap, setRobots } from './seo.config'
import 'core-js/features/array/at'

// Load theme.json using absolute path from project root
const themeFile = path.join(process.cwd(), 'data', 'theme.json')
const theme = JSON.parse(fs.readFileSync(themeFile, 'utf8'))

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
  const fileName = customPostType === 'service-guides' ? 'service-guides.json' : 'posts.json'
  const postsFile = path.join(process.cwd(), 'data', fileName)
  if (!fs.existsSync(postsFile)) {
    return []
  }

  try {
    return JSON.parse(fs.readFileSync(postsFile, 'utf8'))
  } catch (e) {
    console.warn(`Could not read local ${customPostType} for route generation:`, e.message)
    return []
  }
}

const addLocalPostRoutes = (routes, posts, basePath, postsPerPage = 5) => {
  const pageCount = Math.ceil(posts.length / postsPerPage)
  for (let i = 1; i <= pageCount; i++) {
    routes.push(`/${basePath}/page/` + i)
  }
  posts.forEach((post) => {
    routes.push(`/${basePath}/` + post.slug)
  })
}

// Extract Google Fonts from theme.json typography
const systemFonts = ['helvetica', 'arial', 'sans-serif', 'serif', 'monospace', 'georgia']
const typography = (theme.default && theme.default.typography) || []
const googleFonts = typography
  .flatMap(entry => (entry.font.match(/'([^']+)'/g) || []))
  .map(font => font.replace(/'/g, ''))
  .filter(font => !systemFonts.includes(font.toLowerCase()))
  .map(font => `${font.replace(/\s+/g, '+')}:400,600,700`)

// Add display=swap to last font for better loading performance
if (googleFonts.length > 0) {
  googleFonts[googleFonts.length - 1] += '&display=swap'
}

// Debug: Log extracted fonts
console.log('Theme typography:', typography)
console.log('Google Fonts to load:', googleFonts)

export default () => {
  const meta = setJSONData('home')
  return {
    server: {
      port: 8080,
      host: '0.0.0.0'
    },
    target: 'static',
    generate: {
      async routes () {
        const dyRoutes = []
        const localPosts = getLocalPosts()
        const localServiceGuides = getLocalPosts('service-guides')

        if (localPosts.length) {
          addLocalPostRoutes(dyRoutes, localPosts, 'blog')
        } else {
          try {
            await axios.get(`${api}/wp/v2/posts?per_page=100`).then(async (response) => {
              const dataPages = totalPages(response)
              let postsArray = responseArray(response, 'Could not fetch blog posts for route generation')
              dyRoutes.push('/blog/page/1')
              for (let i = 2; i <= dataPages; i++) {
                const nextPage = await axios.get(
                  `${api}/wp/v2/posts?per_page=100&page=${i}`
                )
                postsArray = [...postsArray, ...responseArray(nextPage, 'Could not fetch blog posts for route generation')]
                dyRoutes.push('/blog/page/' + i)
              }
              return postsArray.forEach((post) => {
                dyRoutes.push('/blog/' + post.slug)
              })
            })
          } catch (e) {
            console.warn('Could not fetch blog posts for route generation:', e.message)
          }
        }

        if (localServiceGuides.length) {
          addLocalPostRoutes(dyRoutes, localServiceGuides, 'service-guides')
        }

        return dyRoutes
      }
    },
    head: siteHead(meta, theme),
    globalName: 'globalContent',
    loading: { color: '#fff' },
    components: {
      dirs: [
        '~/components',
        '~/components/custom',
        '~/components/block'
      ]
    },
    polyfill: {
      features: [
        {
          require: 'intersection-observer',
          detect: () => 'IntersectionObserver' in window
        }
      ]
    },
    plugins: [
      '~/resources/components',
      '~/resources/mixins',
      '~/resources/vendors.js',
      {
        src: '~/resources/vendors.client.js',
        mode: 'client'
      },
      {
        src: '~/resources/userway.js',
        mode: 'client'
      }
    ],
    modules: [
      '@nuxtjs/axios',
      '@nuxtjs/style-resources',
      ...(googleFonts.length > 0 ? ['nuxt-webfontloader'] : []),
      '@nuxtjs/robots',
      '@nuxtjs/sitemap',
      'nuxt-polyfill'
    ],
    robots: setRobots,
    sitemap: siteMap,
    css: [
      { src: '~/styles/static/normalize.sass', lang: 'sass' },
      { src: '~/styles/index.sass', lang: 'sass' }
    ],
    styleResources: {
      sass: [
        '~/styles/base/*.sass',
        '~/styles/utilities/*.sass',
        '~/styles/grid/*.sass'
      ]
    },
    stylelint: {
      files: [
        'styles/*.sass',
        'styles/**/*.sass',
        'components/**/*.sass',
        'components/**/**/*.sass'
      ]
    },
    ...(googleFonts.length > 0 && {
      webfontloader: {
        google: {
          families: googleFonts
        }
      }
    }),
    buildModules: [
      '@nuxtjs/eslint-module',
      '@nuxtjs/stylelint-module',
      'nuxt-gsap-module'
    ],
    gsap: {
      extraPlugins: {
        scrollTrigger: true
      },
      clubPlugins: {
        customEase: true,
        splitText: true
      },
      extraEases: {
        customEase: true
      }
    },
    vue: {
      config: {
        productionTip: false
      }
    },
    build: buildConfig
  }
}
