import { Application, Request, Response } from 'express'
import { randomBytes } from 'crypto'

export type OauthOpts = {
  slug: string
  authUrl: string
  baseUrl: string
  clientId: string
  scopes?: string[]
  getAuthInfo: (code: string, redirectUri: string, state: string) => Promise<AuthInfo>
  onAuthenticated: (req: Request, res: Response, authInfo: AuthInfo) => void
}

type AuthInfo = {
  accessToken: string
  refreshToken?: string
}

export function create({ slug, authUrl, baseUrl, clientId, scopes, getAuthInfo, onAuthenticated }: OauthOpts) {
  const callbackPath = `/${slug}/callback`
  const redirectUri = `${baseUrl}${callbackPath}`
  const stateKey = `${slug}-oauth-state`
  const scope = (scopes || []).join(' ')
  const baseAuthUrl = `${authUrl}?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`

  const authHandler = (req: Request, res: Response) => {
    const state = randomBytes(32).toString('hex')

    req.session[stateKey] = state

    res.redirect(`${baseAuthUrl}&state=${state}`)
  }

  const callbackHandler = (req: Request, res: Response) => {
    const { session } = req
    const state = session[stateKey]

    if (!state || state !== req.query.state || !req.query.code) {
      return res.status(500).end()
    }

    return getAuthInfo(req.query.code, redirectUri, state)
    .then(authInfo => {
      onAuthenticated(req, res, authInfo)
    })
    .catch(() => {
      res.status(500).end()
    })
  }

  return function install (app: Application) {
    app.get(`/${slug}/auth`, authHandler)
    app.get(callbackPath, callbackHandler)
  }
}
