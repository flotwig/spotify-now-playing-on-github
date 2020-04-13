import * as _ from 'lodash'
import * as Db from '../db'
import { GitHubApi, GitHubUserStatus } from '../github'
import { SpotifyApi, SpotifyNowPlaying, SpotifyArtist } from '../spotify'

class TaskError extends Error{
  constructor(msg: string) {
    super(`Now Playing Task: ${msg}`)
  }
}

const log = console.log

function msToString(ms: number) {
  const S = Math.floor((ms / 1000) % 60)
  const M = Math.floor(ms / (60 * 1000))
  return [M,String(S).padStart(2, '0')].join(':')
}

function formatArtists(artists: SpotifyArtist[]) {
  if (!artists.length) {
    return ''
  }

  return ` (${artists.slice(0, 3).map(artist => {
    return artist.name
  }).join(', ')})`
}

// TODO: add support for podcast episodes
function formatStatus(np: SpotifyNowPlaying) {
  const { item } = np
  if (!item) {
    throw new TaskError('missing np item')
  }

  const staticPrefix = `NP: `
  const staticSuffix = ` (${msToString(np.progress_ms)}/${msToString(np.item.duration_ms)})`

  // github truncates status messages after 56 characters
  const maxInnerLength = 56 - staticPrefix.length - staticSuffix.length
  let inner = `${np.item.name}${formatArtists(np.item.artists)}`

  if (inner.length > maxInnerLength) {
    inner = inner.slice(0, maxInnerLength - 1) + '…'
  }

  return [staticPrefix, inner, staticSuffix].join('')
}

export function start(db: Db.Db, spotify: SpotifyApi, github: GitHubApi) {
  // resolves with user's replaced real status, if any
  async function checkPair(pair: Db.Pair): Promise<GitHubUserStatus | null> {
    // check if the user is "now playing" something on spotify
    const np = await spotify.getNowPlaying(pair.spotifyToken, pair.spotifyRefreshToken, (newAuthInfo) => {
      pair.set('spotifyToken', newAuthInfo.accessToken)
      pair.set('spotifyRefreshToken', newAuthInfo.refreshToken)
    })

    // get the user's original github status
    const ghUser = await github.getUser(pair.githubToken)

    const _log = (...args) => log(`spotify user: ${pair.spotifyUniqueId} - gh user: ${ghUser.login} -`, ...args)

    const shouldSync = np.is_playing && (pair.syncExplicit || !np.item.explicit)

    if (shouldSync) {
      // attempt to update the user's GitHub status
      const message = formatStatus(np)

      _log('shouldSync is true, setting status:', message)

      const lastNowPlayingAt = pair.lastNowPlayingAt

      await github.setUserStatus(pair.githubToken, {
        message,
        emoji: ':musical_note:'
      })
      .then(res => {
        if (res.message !== message) {
          throw new TaskError('setting message failed')
        }
      })

      pair.set('lastNowPlayingAt', new Date())

      // if the user previously had a status with a newer timestamp than lastCheckedAt, or if it was null,
      // it was replaced
      if (!ghUser.status || lastNowPlayingAt < new Date(ghUser.status.updatedAt)) {
        _log('storing old status:', ghUser.status)

        if (!ghUser.status) {
          pair.set('lastManualStatusWasNull', true)
        }

        return ghUser.status
      }

      return pair.lastManualStatus
    }

    _log('not playing anything syncable')

    // not playing anything
    // if the user has a status set with a newer timestamp than now, we can quit now
    if (ghUser.status && new Date(ghUser.status.updatedAt) > new Date()) {
      return null
    }

    // otherwise, restore the user's lastManualStatus if one exists
    if (pair.lastManualStatus || pair.lastManualStatusWasNull) {
      _log('restoring last manual status', pair.lastManualStatus)
      await github.setUserStatus(pair.githubToken, pair.lastManualStatus || { message: '', emoji: '' })
      pair.set('lastManualStatusWasNull', false)
    }

    return null
  }

  function sweep() {
    db.Pair.getActive()
    .then(activePairs => {
      log(`found ${activePairs.length} active pairs`)
      return Promise.all(
        activePairs.map(activePair => {
          return checkPair(activePair)
          .then(manualStatus => {
            if (!_.isEqual(manualStatus, activePair.lastManualStatus)) {
              activePair.set('lastManualStatus', manualStatus || null)
              activePair.changed('lastManualStatus', true)
            }

            activePair.set('lastCheckedAt', new Date())
            activePair.set('syncs', activePair.syncs+1)

            return activePair.save()
          })
          .catch(console.error)
        })
      )
    })
    .catch(err => {
      console.error(`error while getting active pairs: ${err}`)
    })
    .then(() => {
      setTimeout(sweep, 5000)
    })
  }

  sweep()
}
