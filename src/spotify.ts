import axios from 'axios'

type SpotifyOpts = {
  apiUrl: string
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

type SpotifyNowPlaying = {
  progress_ms: number
  is_playing: boolean
  item: SpotifyItem
}

type SpotifyItem = SpotifyFullTrackObject | SpotifyFullEpisodeObject

type SpotifyFullEpisodeObject = {
  explicit: boolean
  name: string
  duration_ms: number
  show: SpotifyShow
}

type SpotifyFullTrackObject = {
  explicit: boolean
  name: string
  duration_ms: number
  artists: SpotifyArtist[]
  album: SpotifyAlbum[]
}

type SpotifyArtist = {
  name: string
}

type SpotifyAlbum = {
  name: string
}

type SpotifyShow = {
  name: string
}

export function create({ apiUrl }: SpotifyOpts) {
  const get = (accessToken: string, path: string) => {
    const authorization = `Bearer ${accessToken}`
    return axios.get(`${apiUrl}${path}`, { headers: { authorization }})
    .then(res => {
      return res.data
    })
  }

  return {
    getUser: (accessToken): Promise<SpotifyUser> => {
      // https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
      return get(accessToken, '/me')
    },

    getNowPlaying: (accessToken): Promise<SpotifyNowPlaying> => {
      // https://developer.spotify.com/documentation/web-api/reference/player/get-information-about-the-users-current-playback/
      return get(accessToken, '/me/player')
    }
  }
}
