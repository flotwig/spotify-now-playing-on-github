import * as Oauth from './oauth'
import axios from 'axios'

type GitHubOpts = {
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  baseUrl: string
  onAuthenticated: Oauth.OauthOpts['onAuthenticated']
}

export function create({ clientId, clientSecret, authUrl, tokenUrl, baseUrl, onAuthenticated }: GitHubOpts) {
  const getAuthInfo = (code: string, redirectUri: string, state: string) => {
    // https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow
    return axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      state
    }, {
      headers: {
        accept: 'application/json'
      }
    })
    .then((res) => {
      return {
        accessToken: res.data.access_token
      }
    })
  }

  return Oauth.create({
    slug: 'github',
    scopes: ['user'],
    clientId,
    authUrl,
    baseUrl,
    getAuthInfo,
    onAuthenticated
  })
}
