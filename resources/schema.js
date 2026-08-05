import globalData from '../data/globalData.json'
import { url } from './api'

const dayNames = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

const siteUrl = url.replace(/\/+$/, '')
const organizationId = `${siteUrl}/#organization`
const webSiteId = `${siteUrl}/#website`
const defaultSocialImage = 'https://d20dg8rmreapkm.cloudfront.net/opengraph.jpg'

export const socialImage = (image = '') => String(image).includes('licensed-adobe-assets.s3.us-west-2.amazonaws.com')
  ? defaultSocialImage
  : image

export const absoluteUrl = (path = '') => {
  if (!path) {
    return `${siteUrl}/`
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${siteUrl}/${String(path).replace(/^\/+/, '')}`
}

// vue-meta writes JSON-LD through innerHTML, so a literal "<" in the payload
// could close the script tag early. Escaping it keeps the document valid.
const serialize = data => JSON.stringify(data).replace(/</g, '\\u003c')

export const jsonLdScript = (hid, data) => ({
  hid,
  type: 'application/ld+json',
  innerHTML: serialize(data)
})

// Converts "7:30AM - 6:00PM" into the 24-hour opens/closes pair schema.org wants
const parseHours = (time) => {
  const match = String(time || '').match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i)

  if (!match) {
    return null
  }

  const to24 = (hour, minute, meridiem) => {
    let h = Number(hour) % 12
    if (meridiem.toUpperCase() === 'PM') {
      h += 12
    }
    return `${String(h).padStart(2, '0')}:${minute || '00'}`
  }

  return {
    opens: to24(match[1], match[2], match[3]),
    closes: to24(match[4], match[5], match[6])
  }
}

const openingHours = (hours = []) => hours.reduce((specs, entry) => {
  const day = dayNames[String(entry.day || '').toLowerCase()]
  const parsed = parseHours(entry.time)

  if (day && parsed) {
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day,
      opens: parsed.opens,
      closes: parsed.closes
    })
  }

  return specs
}, [])

export const organizationSchema = () => {
  const location = (globalData.location && globalData.location[0]) || {}
  const address = location.address || {}
  const coordinates = address.coordinates || {}
  const [city, region] = String(address.city_state || '').split(',').map(part => part.trim())
  const hours = openingHours(location.hours)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': organizationId,
    name: globalData.company_name,
    url: `${siteUrl}/`,
    email: globalData.email,
    // Prefer the E.164 number behind the tel: link over the display format
    telephone: (globalData.phone && globalData.phone.href
      ? globalData.phone.href.replace(/^tel:/, '')
      : globalData.phone && globalData.phone.number),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [address.street, address.suite].filter(Boolean).join(' ') || undefined,
      addressLocality: city || undefined,
      addressRegion: region || undefined,
      postalCode: address.postal_code || undefined,
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      },
      geoRadius: '160934',
      description: location.special_note
    }
  }

  if (coordinates.latitude && coordinates.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    }
  }

  if (hours.length) {
    schema.openingHoursSpecification = hours
  }

  return schema
}

export const webSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': webSiteId,
  url: `${siteUrl}/`,
  name: globalData.company_name,
  publisher: { '@id': organizationId }
})

// Turns "/service-guides/how-hvac-cleaning-works" into Home > Service Guides > <page name>
export const breadcrumbSchema = (path, pageName) => {
  const segments = String(path || '').split('/').filter(Boolean)

  if (!segments.length) {
    return null
  }

  const labelFor = segment => segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const items = [{
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: `${siteUrl}/`
  }]

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1

    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: isLast && pageName ? pageName : labelFor(segment),
      item: absoluteUrl(segments.slice(0, index + 1).join('/'))
    })
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  }
}

export const serviceSchema = ({ name, description, path, image }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description: description || undefined,
  serviceType: name,
  url: absoluteUrl(path),
  image: image || undefined,
  provider: { '@id': organizationId },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: '42.3501',
      longitude: '-71.2290'
    },
    geoRadius: '160934'
  }
})

export const articleSchema = ({ title, description, path, image, datePublished, dateModified, type = 'BlogPosting' }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  headline: title,
  description: description || undefined,
  image: image || undefined,
  mainEntityOfPage: absoluteUrl(path),
  url: absoluteUrl(path),
  datePublished: datePublished || undefined,
  dateModified: dateModified || datePublished || undefined,
  author: {
    '@type': 'Organization',
    name: 'Air Tech Solutions Team',
    url: `${siteUrl}/about`
  },
  publisher: { '@id': organizationId }
})

export const faqSchema = (questions = []) => {
  const mainEntity = questions.reduce((entities, item) => {
    const answer = (item.paragraphs || [])
      .map(paragraph => paragraph.text)
      .filter(Boolean)
      .join(' ')

    if (item.header && answer) {
      entities.push({
        '@type': 'Question',
        name: item.header,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer
        }
      })
    }

    return entities
  }, [])

  if (!mainEntity.length) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  }
}

export const collectionPageSchema = ({ name, description, path, items = [] }) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description: description || undefined,
  url: absoluteUrl(path),
  isPartOf: { '@id': webSiteId },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path)
    }))
  }
})
