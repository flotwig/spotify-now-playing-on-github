import * as Express from 'express'
import Config from './config'
import * as Db from './db'
import * as Session from 'express-session'
import * as path from 'path'
import * as SpotifyOauth from './controllers/spotify-oauth'
import * as Spotify from './spotify'
import * as GitHubOauth from './controllers/github-oauth'
import * as GitHub from './github'
import * as State from './controllers/state'

const { log } = console

const distDir = path.resolve(__dirname, '../dist')

function start() {
  const app = Express()
  const db = Db.create({ dbUrl: Config.dbUrl })
  const spotify = Spotify.create(Config.spotify)
  const github = GitHub.create(Config.github)

  const maybeSetPairForSession = async function(req: Express.Request) {
    if (!req.session.spotifyUser || !req.session.githubUser) {
      return
    }

    return db.Pair.createFromUniqueIds({
      githubUniqueId: req.session.githubUser.data.viewer.id,
      githubToken: req.session.githubAuthInfo.accessToken,
      spotifyUniqueId: req.session.spotifyUser.id,
      spotifyToken: req.session.spotifyAuthInfo.accessToken,
      spotifyRefreshToken: req.session.spotifyAuthInfo.refreshToken,
    })
    .then(pair => {
      req.session.pair = pair
    })
  }

  app.use(Session({
    cookie: {
      sameSite: 'lax'
    },
    secret: Config.cookieSecret,
    saveUninitialized: false
  }))

  app.use(Express.static(distDir, { cacheControl: false }))

  SpotifyOauth.create({
    baseUrl: Config.baseUrl,
    onAuthenticated: async (req, res, authInfo) => {
      req.session.spotifyAuthInfo = authInfo
      req.session.spotifyUser = await spotify.getUser(authInfo.accessToken)
      await maybeSetPairForSession(req)
      res.redirect('/')
    },
    ...Config.spotify
  })(app)

  GitHubOauth.create({
    baseUrl: Config.baseUrl,
    onAuthenticated: async (req, res, authInfo) => {
      req.session.githubAuthInfo = authInfo
      req.session.githubUser = await github.getUser(authInfo.accessToken)
      await maybeSetPairForSession(req)
      .catch(console.error)
      res.redirect('/')
    },
    ...Config.github
  })(app)

  State.create()(app)

  app.use('*', (_req, res) => {
    res.status(404).sendFile(`${distDir}/404.html`)
  })

  app.listen(Config.port, () => {
    log(`Listening on ${Config.port}`)
  })
}

start()
