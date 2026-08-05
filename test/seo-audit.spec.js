import { siteMap } from '@/config/seo.config'
import posts from '@/data/posts.json'
import serviceGuides from '@/data/service-guides.json'
import { articleSchema, organizationSchema, socialImage } from '@/resources/schema'
import { setJSONData, setMeta } from '@/resources/utils'

describe('SEO audit regressions', () => {
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

  test('excludes pagination URLs from blog and service-guide sitemaps', async () => {
    const blogRoutes = await siteMap.sitemaps[1].routes()
    const guideRoutes = await siteMap.sitemaps[2].routes()
    const urls = [...blogRoutes, ...guideRoutes].map(route => route.url)

    expect(urls.some(route => route.includes('/page/'))).toBe(false)
  })
})
