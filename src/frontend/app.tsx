import * as React from 'react'
import { State } from '../controllers/state'

// @ts-ignore
import githubLogo from './assets/github.png'

// @ts-ignore
import spotifyLogo from './assets/spotify.png'

import './app.scss'

export default class App extends React.Component {
  state: {
    remote?: State
  } = {
    remote: undefined
  }

  componentDidMount() {
    fetch('/state')
    .then(res => {
      return res.json()
    })
    .then(res => {
      this.setState({ remote: res })
    })
  }

  render() {
    return (
      <div className="app">
        <h1>Welcome to <code>now-playing</code>!</h1>
        This is a tool that replicates your "Now Playing" status from Spotify to GitHub:
        insert photo here
        <div className="wizard">
          {this._renderSpotifyConnect()}
          {this._renderGitHubConnect()}
        </div>
        {this._renderPair()}
      </div>
    )
  }

  _renderSpotifyConnect() {
    const { remote } = this.state

    return (
      <div className="connect spotify">
        <a href="/spotify/auth" className="button">
          <img src={spotifyLogo}/> Connect Spotify
        </a>
        <div className="status">
          {remote ? (
            remote.spotifyUser ? `✔ Connected as ${remote.spotifyUser.display_name}!`
            : <span className="subtle">❌ Not connected.</span>
            ) : <span className="subtle">Loading...</span>
          }
        </div>
      </div>
    )
  }

  _renderGitHubConnect() {
    const { remote } = this.state

    return (
      <div className="connect github">
        <a href="/github/auth" className="button">
          <img src={githubLogo}/> Connect GitHub
        </a>
        <div className="status">
          {remote ? (
            remote.githubUser ? `✔ Connected as ${remote.githubUser.data.viewer.login}!`
            : <span className="subtle">❌ Not connected.</span>
            ) : <span className="subtle">Loading...</span>
          }
        </div>
      </div>
    )
  }

  _renderPair() {
    const { remote } = this.state

    if (!remote) {
      return <div className="pair"><span className="subtle">Loading...</span></div>
    }

    if (!remote.spotifyUser || !remote.githubUser) {
      return <div className="pair"><span className="subtle">Connect a Spotify account and a GitHub account to get started.</span></div>
    }

    const { pair } = remote

    if (!pair) {
      return <div className="pair"><span className="subtle">Error: Unpaired</span></div>
    }

    return <div className="pair">
      Spotify has successfully been linked to your GitHub!<br/>
      <br/>

      <span className="subtle">
        Last sync at: {pair.lastCheckedAt || 'never synced'}<br/>
        Total number of syncs: {pair.syncs || 'never synced'}<br/>
        Currently active: {pair.active ? 'yes': 'no'}

      </span>
    </div>
  }
}
