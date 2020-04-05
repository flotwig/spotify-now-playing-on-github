require('dotenv').config()

function getConfig() {
  return {
    port: Number(process.env.PORT || 4000),
    dbUrl: process.env.DB_URL,
    baseUrl: process.env.BASE_URL,
    cookieSecret: process.env.COOKIE_SECRET,
    spotify: {
      apiUrl: process.env.SPOTIFY_API_URL || 'https://api.spotify.com/v1',
      authUrl: process.env.SPOTIFY_AUTH_URL || 'https://accounts.spotify.com/authorize',
      tokenUrl: process.env.SPOTIFY_TOKEN_URL || 'https://accounts.spotify.com/api/token',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    github: {
      apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com/graphql',
      authUrl: process.env.GITHUB_AUTH_URL || 'https://github.com/login/oauth/authorize',
      tokenUrl: process.env.GITHUB_TOKEN_URL || 'https://github.com/login/oauth/access_token',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  }
}

const config = getConfig()

export default config
