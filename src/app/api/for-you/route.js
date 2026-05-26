import { MOCK_FOR_YOU } from './mockData'

export async function GET() {
  return Response.json(MOCK_FOR_YOU)
}
