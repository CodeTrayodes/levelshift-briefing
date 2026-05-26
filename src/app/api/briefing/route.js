import { MOCK_BRIEFING } from './mockData'

const BEAT_CATEGORIES = {
  competitors: ['Competitor Move'],
  'ai tools':  ['AI Tool', 'New Tool'],
  campaigns:   ['Campaign Intel'],
  trends:      ['Industry Trend', 'Research'],
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const beat = searchParams.get('beat') || 'all'

  const categories = BEAT_CATEGORIES[beat.toLowerCase()]

  const articles = categories
    ? MOCK_BRIEFING.articles.filter(a => categories.includes(a.category))
    : MOCK_BRIEFING.articles

  // Ensure the first article in a filtered view becomes the lead
  const normalized = articles.map((a, i) => ({ ...a, isLead: i === 0 }))

  return Response.json({
    articles:    normalized,
    digest:      MOCK_BRIEFING.digest,
    fetchedAt:   new Date().toISOString(),
    sourceCount: MOCK_BRIEFING.sourceCount,
  })
}
