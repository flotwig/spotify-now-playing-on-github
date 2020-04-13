import { pick } from 'lodash'
import { Pair } from '../db/pair'
import { GitHubUser } from '../github'
import { SpotifyUser } from '../spotify'

export type State = {
  githubUser: GitHubUser
  spotifyUser: SpotifyUser
  pair: Pick<Pair, 'lastCheckedAt' | 'syncs' | 'active'>
}

export function state (req, res) {
  const state: State = {
    githubUser: req.session.githubUser,
    spotifyUser: req.session.spotifyUser,
    pair: pick(req.session.pair, 'lastCheckedAt', 'syncs', 'active')
  }

  res.json(state)
}
