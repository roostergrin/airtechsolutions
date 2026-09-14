import { siteMap } from '@/config/seo.config'
import { siteHead } from '@/config/head.config'
import posts from '@/data/posts.json'
import serviceGuides from '@/data/service-guides.json'
import locationPages from '@/data/location-pages.json'
import areasPage from '@/data/areas-we-serve.json'
import router from '@/router'
import { articleSchema, organizationSchema, socialImage } from '@/resources/schema'
import { setAreasWeServePage } from '@/resources/areas-we-serve'
import { setJSONData, setMeta } from '@/resources/utils'

describe('SEO audit regressions', () => {
  test('uses the configured GTM container instead of the retired GA tag', () => {
    const head = siteHead({ title: 'Test', seo: {} })
    const gtmScript = head.script.find(script => script.hid === 'gtm')

    expect(gtmScript.innerHTML).toContain('GTM-M23CSNRD')
    expect(JSON.stringify(head.script)).not.toContain('G-EP9BQ2J5P8')
  })

  test('emits a complete local business address', () => {
    expect(organizationSchema().address).toMatchObject({
      streetAddress: '93 Border St',
      addressLocality: 'West Newton',
      addressRegion: 'MA',
      postalCode: '02465',
      addressCountry: 'US'
    })
  })

  test('attributes articles to the Air Tech Solutions team', () => {
    expect(articleSchema({ title: 'Test', path: '/blog/test' }).author).toEqual({
      '@type': 'Organization',
      name: 'Air Tech Solutions Team',
      url: 'https://www.airtechsolutions.com/about'
    })
  })

  test('adds FAQPage schema to service pages with accordion content', () => {
    const page = setJSONData('commercial-window-cleaning-boston-west-newton-ma')
    const head = setMeta(page, '/commercial-window-cleaning-boston-west-newton-ma')
    const faqScript = head.script.find(script => script.hid === 'ld-faq')

    expect(JSON.parse(faqScript.innerHTML)).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Question',
          name: 'Do you clean interior glass too?'
        })
      ])
    })
  })

  test('uses the owned CDN fallback for licensed bucket social images', () => {
    expect(socialImage('https://licensed-adobe-assets.s3.us-west-2.amazonaws.com/adobe-stock-images/about-hero.jpg'))
      .toBe('https://d20dg8rmreapkm.cloudfront.net/opengraph.jpg')
  })

  test('keeps blog metadata within search result length targets', () => {
    posts.forEach((post) => {
      const seo = post.acf.seo

      expect(seo.page_title.length).toBeLessThanOrEqual(65)
      expect(seo.page_description.length).toBeGreaterThanOrEqual(140)
      expect(seo.page_description.length).toBeLessThanOrEqual(155)
      expect(seo.social_meta.og_meta.title).toBe(seo.page_title)
      expect(seo.social_meta.og_meta.description).toBe(seo.page_description)
    })
  })

  test('keeps service-guide titles concise and locally relevant', () => {
    serviceGuides.forEach((guide) => {
      const seo = guide.acf.seo

      expect(seo.page_title).toContain('Boston MA')
      expect(seo.page_title.length).toBeLessThanOrEqual(65)
      expect(seo.social_meta.og_meta.title).toBe(seo.page_title)
    })
  })

  test('includes complete metadata for every New England location page', async () => {
    const routes = await siteMap.sitemaps[0].routes()
    const sitemapUrls = routes.map(route => route.url)

    expect(Object.keys(locationPages)).toHaveLength(6)
    Object.entries(locationPages).forEach(([slug, page]) => {
      const seo = page.seo

      expect(seo.page_title).toContain('Air Tech Solutions')
      expect(seo.page_description).toContain('Fully insured and credentialed.')
      expect(seo.social_meta.og_meta.title).toBe(seo.page_title)
      expect(seo.social_meta.og_meta.description).toBe(seo.page_description)
      expect(sitemapUrls).toContain(`/${slug}`)
      expect(page.images.hero.src).toMatch(/^\/images\/locations\//)
      expect(page.images.sections).toHaveLength(2)
    })

    expect(sitemapUrls).toContain('/areas-we-serve')
    expect(areasPage.seo.social_meta.og_meta.title).toBe(areasPage.seo.page_title)
  })

  test('uses one Areas We Serve menu link and lists all locations on its page', () => {
    const about = router.find(item => item.name === 'About')
    const areasLinks = about.children.filter(item => item.name === 'Areas We Serve')
    const locationRoutes = Object.keys(locationPages).map(slug => `/${slug}`)
    const navRoutes = about.children.map(item => item.path)
    const page = setAreasWeServePage()
    const locations = page.sections.find(section => section.component_options && section.component_options.hash === 'locations')

    expect(areasLinks).toEqual([{ name: 'Areas We Serve', path: '/areas-we-serve' }])
    locationRoutes.forEach(route => expect(navRoutes).not.toContain(route))
    expect(locations.items).toHaveLength(6)
    expect(locations.items.map(item => item.button.path)).toEqual(locationRoutes)
  })

  test('excludes pagination URLs from blog and service-guide sitemaps', async () => {
    const blogRoutes = await siteMap.sitemaps[1].routes()
    const guideRoutes = await siteMap.sitemaps[2].routes()
    const urls = [...blogRoutes, ...guideRoutes].map(route => route.url)

    expect(urls.some(route => route.includes('/page/'))).toBe(false)
  })
})
