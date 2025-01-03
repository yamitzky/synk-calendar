import type { User } from '@synk-cal/core'
import metadata from 'gcp-metadata'
import { OAuth2Client } from 'google-auth-library'

let _aud = ''

async function audience(): Promise<string> {
  if (!_aud && (await metadata.isAvailable())) {
    const project_number = await metadata.project('numeric-project-id')
    const project_id = await metadata.project('project-id')

    _aud = `/projects/${project_number}/apps/${project_id}`
  }

  return _aud
}

async function validateAssertion(assertion: string | null) {
  if (!assertion) {
    return {}
  }

  const aud = await audience()

  const oAuth2Client = new OAuth2Client()
  const response = await oAuth2Client.getIapPublicKeys()
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(assertion, response.pubkeys, aud, [
    'https://cloud.google.com/iap',
  ])
  const payload = ticket.getPayload()

  return {
    email: payload?.email,
    sub: payload?.sub,
  }
}

export async function extractUserFromHeader(headers: Headers): Promise<User | undefined> {
  const assertion = headers.get('x-goog-iap-jwt-assertion')
  const info = await validateAssertion(assertion)
  if (info.email) {
    return { email: info.email }
  }
}
