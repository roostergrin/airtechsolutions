import globalData from '@/data/globalData.json'
import pages from '@/data/pages.json'
import posts from '@/data/posts.json'
import serviceGuides from '@/data/service-guides.json'

// WCAG 2.2 AA - 2.5.3 Label in Name.
// An interactive control's accessible name must contain its visible text label,
// so speech-input users can activate it by saying what they see. Content authors
// set both halves in the JSON sources: `label`/`number` renders as visible text
// and `aria_label`/`aria` becomes the accessible name.
const normalize = value => String(value).toLowerCase().replace(/\s+/g, ' ').trim()

const visibleLabelFields = ['label', 'text', 'number']

const collectLabelledControls = (node, path, found) => {
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectLabelledControls(child, `${path}[${i}]`, found))
    return found
  }

  if (!node || typeof node !== 'object') {
    return found
  }

  ;['aria_label', 'aria'].forEach((ariaField) => {
    const accessibleName = node[ariaField]
    if (typeof accessibleName !== 'string' || !accessibleName) {
      return
    }

    const visibleField = visibleLabelFields.find(field => typeof node[field] === 'string' && node[field])
    if (!visibleField) {
      return
    }

    found.push({
      path: `${path}.${ariaField}`,
      visibleLabel: node[visibleField],
      accessibleName
    })
  })

  Object.keys(node).forEach(key => collectLabelledControls(node[key], `${path}.${key}`, found))

  return found
}

describe('accessibility audit regressions', () => {
  const sources = {
    'data/pages.json': pages,
    'data/globalData.json': globalData,
    'data/posts.json': posts,
    'data/service-guides.json': serviceGuides
  }

  Object.keys(sources).forEach((source) => {
    test(`accessible names in ${source} contain their visible labels (WCAG 2.5.3)`, () => {
      const controls = collectLabelledControls(sources[source], '', [])
      const mismatches = controls.filter(
        control => !normalize(control.accessibleName).includes(normalize(control.visibleLabel))
      )

      expect(mismatches).toEqual([])
    })
  })

  test('finds the controls it is meant to be checking', () => {
    expect(collectLabelledControls(pages, '', []).length).toBeGreaterThan(20)
  })
})
