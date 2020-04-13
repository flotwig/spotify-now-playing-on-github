import axios from 'axios'
import * as querystring from 'querystring'

type SpotifyOpts = {
  apiUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
}

export type SpotifyUser = {
  id: string
  display_name: string
  images: SpotifyImage[]
}

type SpotifyImage = {
  width: number | null
  height: number | null
  url: string
}

export type SpotifyNowPlaying = {
  progress_ms: number
  is_playing: boolean
  item: SpotifyItem
}

// TODO: add support for podcast episodes
type SpotifyItem = SpotifyFullTrackObject //| SpotifyFullEpisodeObject

// type SpotifyFullEpisodeObject = {
//   explicit: boolean
//   name: string
//   duration_ms: number
//   show: SpotifyShow
// }

// type SpotifyShow = {
//   name: string
// }

type SpotifyFullTrackObject = {
  explicit: boolean
  name: string
  duration_ms: number
  artists: SpotifyArtist[]
  album: SpotifyAlbum[]
}

export type SpotifyArtist = {
  name: string
}

type SpotifyAlbum = {
  name: string
}


export function create({ apiUrl, tokenUrl, clientId, clientSecret }: SpotifyOpts) {
  const appAuthorization = `Basic ${Buffer.from([clientId, clientSecret].join(':')).toString('base64')}`

  const refresh = (refreshToken: string) => {
    return axios.post(tokenUrl, querystring.encode({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }), {
      headers: { authorization: appAuthorization }
    })
  }

  const get = (accessToken: string, refreshToken: string, path: string, onRefreshedToken?) => {
    const _get = (_accessToken) => {
      const authorization = `Bearer ${_accessToken}`
      return axios.get(`${apiUrl}${path}`, { headers: { authorization }})
    }

    return _get(accessToken)
    .catch(err => {
      if (err.response && err.response.status === 401) {
        return refresh(refreshToken)
        .then(({ data }) => {
          onRefreshedToken && onRefreshedToken({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken
          })

          return data.access_token
        })
        .then(_get)
      }

      throw err
    })
    .then(res => {
      return res.data
    })
  }

  return {
    getUser: (accessToken, refreshToken): Promise<SpotifyUser> => {
      // https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
      return get(accessToken, refreshToken, '/me')
    },

    getNowPlaying: (accessToken, refreshToken, onRefreshedToken): Promise<SpotifyNowPlaying> => {
      // https://developer.spotify.com/documentation/web-api/reference/player/get-information-about-the-users-current-playback/
      return get(accessToken, refreshToken, '/me/player', onRefreshedToken)
    }
  }
}

export type SpotifyApi = ReturnType<typeof create>
