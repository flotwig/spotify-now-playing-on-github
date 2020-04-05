import * as Oauth from './oauth'
import axios from 'axios'
import { stringify } from 'querystring'

type SpotifyOpts = {
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  baseUrl: string
  onAuthenticated: Oauth.OauthOpts['onAuthenticated']
}

export function create({ clientId, clientSecret, authUrl, tokenUrl, baseUrl, onAuthenticated}: SpotifyOpts) {
  const getAuthInfo = (code: string, redirectUri: string) => {
    // https://developer.spotify.com/documentation/general/guides/authorization-guide/
    return axios.post(tokenUrl, stringify({
      'grant_type': 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    }))
    .then((res) => {
      return {
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token
      }
    })
  }

  return Oauth.create({
    slug: 'spotify',
    scopes: ['user-read-playback-state'],
    clientId,
    authUrl,
    baseUrl,
    getAuthInfo,
    onAuthenticated
  })
}
