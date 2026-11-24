/**
 * Publishes scheduled blog posts at build time.
 *
 * scheduled/blog-posts.json holds posts that are written ahead of time. On
 * every build/generate, each scheduled post whose date (America/New_York) is
 * today or earlier is merged into data/posts.json, newest first. Posts that
 * are still in the future stay out of posts.json, so they are not routed,
 * listed, bundled, or added to the sitemap, RSS, llms.txt, or urllist.txt.
 *
 * The file lives outside data/ on purpose: resources/utils.js requires
 * data/*.json dynamically, so anything in data/ ends up in the client bundle.
 * A weekly scheduled pipeline run picks up each new post on its date.
 * Set PUBLISH_DATE=YYYY-MM-DD to preview the site as of another day.
 */
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(process.cwd(), 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')
const SCHEDULED_FILE = path.join(process.cwd(), 'scheduled', 'blog-posts.json')
const TIME_ZONE = 'America/New_York'

const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'))

const todayInTimeZone = () => {
  if (process.env.PUBLISH_DATE) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(process.env.PUBLISH_DATE)) {
      throw new Error(`PUBLISH_DATE must be YYYY-MM-DD, got "${process.env.PUBLISH_DATE}"`)
    }
    return process.env.PUBLISH_DATE
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const get = type => parts.find(part => part.type === type).value
  return `${get('year')}-${get('month')}-${get('day')}`
}

const postDay = post => String(post.date || '').slice(0, 10)

const main = () => {
  if (!fs.existsSync(SCHEDULED_FILE)) {
    console.log('publish-scheduled-posts: no scheduled/blog-posts.json, nothing to do')
    return
  }

  const today = todayInTimeZone()
  const posts = readJSON(POSTS_FILE)
  const scheduled = readJSON(SCHEDULED_FILE)
  const published = new Set(posts.map(post => post.slug))

  scheduled.forEach((post) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(postDay(post))) {
      throw new Error(`publish-scheduled-posts: "${post.slug}" has no valid date`)
    }
  })

  const hasImage = (post) => {
    const blog = (post.acf && post.acf.blog_post) || {}
    return Boolean(blog.main_image && blog.main_image.src && blog.thumbnail_image && blog.thumbnail_image.src)
  }
  scheduled
    .filter(post => postDay(post) <= today && !hasImage(post))
    .forEach(post => console.warn(`publish-scheduled-posts: holding "${post.slug}" because it has no image`))

  const due = scheduled.filter(post => postDay(post) <= today && !published.has(post.slug) && hasImage(post))
  const waiting = scheduled.filter(post => postDay(post) > today)

  if (due.length) {
    const merged = posts
      .concat(due)
      .map((post, index) => ({ post, index }))
      .sort((a, b) => (postDay(b.post) < postDay(a.post) ? -1 : postDay(b.post) > postDay(a.post) ? 1 : a.index - b.index))
      .map(entry => entry.post)
    fs.writeFileSync(POSTS_FILE, JSON.stringify(merged, null, 2) + '\n')
  }

  const next = waiting.map(postDay).sort()[0]
  console.log(`publish-scheduled-posts: ${today} (${TIME_ZONE}) published ${due.length}, ${waiting.length} still scheduled${next ? `, next on ${next}` : ''}`)
}

main()
