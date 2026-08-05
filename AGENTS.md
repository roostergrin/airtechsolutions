# Lakeshore Orthodontics - Nuxt.js Project

## Project Overview
This is a Nuxt.js 2 orthodontics website with a component-based architecture using Pug templates, Sass styling, and Vue.js components.

## Architecture & File Structure

### Component Structure
All components follow a three-file pattern:
- `index.vue` or `[component-name].vue` - Main Vue component file
- `index.pug` or `[component-name].pug` - Pug template file
- `index.sass` or `[component-name].sass` - Sass styling file

### Directory Structure
- `components/` - Reusable Vue components
  - `base/` - Base components (buttons, icons, modals, etc.)
  - `block/` - Content block components (accordions, forms, grids, etc.)
  - `dev-mode/` - Development tools and overlays
  - `footer/`, `navigation/`, `hero/` - Layout components
- `pages/` - Nuxt.js pages (auto-routing)
- `layouts/` - Page layouts
- `assets/icons/` - SVG icon files
- `data/` - JSON data files for content
- `styles/` - Global Sass files and utilities
- `resources/` - JavaScript utilities and helpers

### Component Conventions

#### Vue Component Structure
```vue
<template lang='pug' src='./index.pug'></template>

<script>
// Component logic
</script>

<style lang="sass" src="./index.sass"></style>
```

#### Template Files
- Use Pug templating language
- Templates are separated into `.pug` files
- Referenced via `src` attribute in Vue template tag

#### Styling
- Use Sass preprocessor
- Styles are separated into `.sass` files (indented syntax)
- Referenced via `src` attribute in Vue style tag

### Key Features
- **Content Management**: JSON-based content in `data/` directory
- **SEO**: Meta tag management via `resources/utils.js`
- **Animations**: GSAP animations with custom easing
- **Icons**: SVG icon system with dynamic loading
- **Responsive**: Mobile-first responsive design

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint linting
- `npm run test` - Jest testing

### Technology Stack
- **Framework**: Nuxt.js 2
- **Templates**: Pug
- **Styling**: Sass (indented syntax)
- **Animation**: GSAP with SplitText
- **Icons**: SVG with dynamic loading
- **Testing**: Jest
- **Linting**: ESLint

## Development Guidelines
- Follow the three-file component pattern
- Use Pug for templates, Sass for styles
- Keep components modular and reusable
- Utilize the existing utility functions in `resources/`
- Test components with Jest
- Maintain consistent naming conventions

## SEO Regression Testing

The focused SEO regression suite is located at `test/seo-audit.spec.js`. It protects shared metadata and structured-data behavior as well as SEO constraints in the JSON content sources.

Future content, design, and engineering work should generally account for SEO and marketing best practices for both traditional search engines and AI-assisted search. Preserve clear search intent, accurate titles and heading hierarchy, crawlable server-rendered content, useful internal links, complete structured data, local relevance, and persuasive calls to action. Favor specific, answer-first copy that AI systems can extract and cite while still reading naturally for prospective customers. Do not keyword-stuff, add hidden SEO copy, duplicate thin pages, or make marketing and schema claims that are not supported by verified business facts.

Run it before pushing changes that affect page content, metadata, schema, routing, sitemaps, social images, article data, or service guides. It is also recommended as a general pre-push check:

```sh
./node_modules/.bin/jest test/seo-audit.spec.js --runInBand --coverage=false
```

The suite currently checks:
- Complete LocalBusiness address output
- Article author attribution
- FAQPage schema generation for service pages
- Owned-CDN fallback behavior for licensed social images
- Blog title and description length targets and matching social metadata
- Concise, geo-qualified service-guide titles and matching social metadata
- Exclusion of pagination URLs from content sitemaps

Treat this suite as maintained project documentation, not a frozen one-time audit. When SEO requirements, business facts, route structures, content types, metadata conventions, or schema behavior change, update the implementation and the corresponding assertions together. Prefer rules that iterate over all relevant content so future entries are covered automatically. Keep hardcoded values only for intentional business facts or representative end-to-end regression cases.

The focused suite does not replace `npm run lint` or relevant component tests. The repository's complete Jest run currently includes a pre-existing `test/Logo.spec.js` failure because it imports the nonexistent `components/Logo.vue`; do not attribute that unrelated failure to SEO changes.

## Task Planning Instructions
When working on tasks in this project, always:
1. **Plan First**: Use TodoWrite to break down tasks into bite-sized pieces
2. **Create Three Files**: For new components, plan to create all three files (.vue, .pug, .sass)
3. **Edit Incrementally**: Work on one file at a time, marking todos as complete
4. **Test Changes**: Run `npm run lint` after making changes
5. **Follow Patterns**: Study existing components before creating new ones

Example task breakdown for a new component:
- [ ] Create component Vue file with basic structure
- [ ] Create Pug template file
- [ ] Create Sass styling file
- [ ] Test component integration
- [ ] Run linting and fix any issues

## Development Server
- Do NOT run `npm run dev` after making changes unless explicitly asked to. Assume the developer already has the dev server running — changes hot-reload automatically.
- To verify changes, run `npm run lint` (and Jest tests where relevant) instead of starting a dev server.
