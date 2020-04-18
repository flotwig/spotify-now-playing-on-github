import { Application } from 'express'
import { pick, isEmpty, mapValues } from 'lodash'
import { Pair } from '../db/pair'
import { GitHubUser } from '../github'
import { SpotifyUser } from '../spotify'
import * as bodyParser from 'body-parser'
import * as Db from '../db'

export type State = {
  githubUser: GitHubUser
  spotifyUser: SpotifyUser
  pair: Pick<Pair, 'lastCheckedAt' | 'syncs' | 'active' | 'syncExplicit'>
}

const WRITEABLE_KEYS = ['active', 'syncExplicit']

export function install(app: Application, db: Db.Db, maybeSetPairForSession) {
  app.use('/state', bodyParser.json())
  app.post('/state', async (req, res) => {
    await maybeSetPairForSession(req)

    if (req.body && req.body.pair && req.session.pair) {
      let writes = pick(req.body.pair, WRITEABLE_KEYS)

      if (!isEmpty(writes)) {
        writes = mapValues(writes, Boolean)

        await db.Pair.createFromUniqueIds(req.session.pair)
        .then(pair => {
          pair.set(writes)
          req.session.pair = pair
          return pair.save()
        })
      }
    }

    const state: State = {
      githubUser: req.session.githubUser,
      spotifyUser: req.session.spotifyUser,
      pair: pick(req.session.pair, 'lastCheckedAt', 'syncs', 'active', 'syncExplicit')
    }

    res.json(state)
  })
}
