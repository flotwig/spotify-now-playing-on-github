import { Application } from 'express'
import { Pair } from '../db/pair'
import { GitHubUser } from '../github'
import { SpotifyUser } from '../spotify'

export type State = {
  githubUser: GitHubUser
  spotifyUser: SpotifyUser
  pair: Pair
}

export function create() {
  return function install (app: Application) {
    app.get('/state', (req, res) => {
      const state: State = {
        githubUser: req.session.githubUser,
        spotifyUser: req.session.spotifyUser,
        pair: req.session.pair
      }

      res.json(state)
    })
  }
}
