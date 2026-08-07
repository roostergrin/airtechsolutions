import { url } from '../resources/api'
import { organizationSchema, webSiteSchema, jsonLdScript, socialImage } from '../resources/schema'

// Set SEO_NOINDEX=true for staging/preview builds so they stay out of the index.
// Production builds must leave it unset so pages are indexable.
const robotsContent = process.env.SEO_NOINDEX === 'true' ? 'noindex, nofollow' : 'index, follow'

export const siteHead = (meta, theme = {}) => {
  const faviconUrl = theme?.default?.favicon_url || '/favicon.ico'
  const faviconType = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : faviconUrl.endsWith('.ico') ? 'image/x-icon' : undefined
  const seo = meta.seo || (meta.meta && meta.meta.seo) || {}
  const socialMeta = seo.social_meta || {}
  const ogMeta = socialMeta.og_meta || {}
  return {
    htmlAttrs: { lang: 'en' },
    title: seo.page_title ? seo.page_title : meta.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // no-referrer strips the referrer from our own analytics and outbound links
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { hid: 'robots', name: 'robots', content: robotsContent },
      { hid: 'description', name: 'description', content: seo.page_description || '' },
      seo.page_keywords && { hid: 'keywords', name: 'keywords', content: seo.page_keywords },
      // OG Meta
      { hid: 'og:type', property: 'og:type', content: 'website' },
      ogMeta.title && { hid: 'og:title', property: 'og:title', content: ogMeta.title },
      ogMeta.description && { hid: 'og:description', property: 'og:description', content: ogMeta.description },
      ogMeta.image && { hid: 'og:image', property: 'og:image', content: socialImage(ogMeta.image) },
      { hid: 'og:url', property: 'og:url', content: url }
    ].filter(Boolean),
    link: [
      { rel: 'icon', type: faviconType, href: faviconUrl },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      { hid: 'canonical', rel: 'canonical', href: url }
    ],
    script: [
      jsonLdScript('ld-organization', organizationSchema()),
      jsonLdScript('ld-website', webSiteSchema()),
      {
        hid: 'gtm',
        type: 'text/javascript',
        innerHTML: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-M23CSNRD');
        `
      }
    ],
    // Rendered outside the Vue app on purpose. A <noscript> inside a component
    // template breaks SSR hydration: browsers with scripting enabled parse its
    // contents as raw text, so the real DOM never matches the virtual DOM.
    noscript: [
      {
        hid: 'gtm-noscript',
        innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M23CSNRD" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
        body: true
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      gtm: ['innerHTML'],
      'gtm-noscript': ['innerHTML'],
      'ld-organization': ['innerHTML'],
      'ld-website': ['innerHTML']
    }
  }
}
