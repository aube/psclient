import { getTemplateByName } from '../redis/index.js'
import { materializeLayout } from './layoutParser.js'
import {
  applyPageRegions,
  migratePageRegions,
  normalizePageRegions,
} from './pageRegions.js'

// Pure page assembly: template -> materialize -> page.data.regions.
// Legacy page.html is used only when regions are absent or the template is missing.
export async function composePageHTML(templateHtml, legacyHtml, regions, ctx) {
  if (!templateHtml) {
    if (regions !== undefined && legacyHtml) {
      return applyPageRegions(legacyHtml, regions)
    }

    return legacyHtml || ''
  }

  const baseHtml = await materializeLayout(templateHtml, ctx)

  if (regions !== undefined) {
    return applyPageRegions(baseHtml, regions)
  }

  if (legacyHtml) {
    return applyPageRegions(baseHtml, migratePageRegions(legacyHtml, baseHtml))
  }

  return baseHtml
}

// Builds the effective page HTML from an API ENTITY.
export async function buildPageHTML(host, ENTITY) {
  const data = ENTITY?.data || {}
  const regions = normalizePageRegions(data.regions)
  const template = ENTITY?.template
    ? await getTemplateByName(host, ENTITY.template)
    : undefined

  const ctx = {
    getTemplate: (name) => getTemplateByName(host, name),
    templatesData: data.template2 || {},
  }

  return composePageHTML(
    template?.html || '',
    ENTITY?.html || '',
    regions,
    ctx,
  )
}
