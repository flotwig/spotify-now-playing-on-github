import * as React from 'react'
import { State } from '../controllers/state'

// @ts-ignore
import githubLogo from './assets/github.png'

// @ts-ignore
import spotifyLogo from './assets/spotify.png'

// @ts-ignore
import screenshot from './assets/ss.png'

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

  _setRemotePair(pair: Partial<State['pair']>) {
    this.setState(undefined)

    fetch('/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pair })
    })
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
        <h1>Welcome to <code>np.chary.us</code>!</h1>
        This is a tool that replicates your "Now Playing" status from Spotify to GitHub, so it shows up as your user status on your profile. It looks something like this:
        <img style={{ display: 'block', margin: 'auto' }} src={screenshot} alt="Screenshot of Now Playing on GitHub profile"/>
        <div className="wizard">
          {this._renderSpotifyConnect()}
          {this._renderGitHubConnect()}
        </div>
        {this._renderPair()}
        <div className="footer">
          Visit the <a href="https://github.com/flotwig/spotify-now-playing-on-github">GitHub repo</a> to report bugs or request features.
        </div>
      </div>
    )
  }

  _renderSpotifyConnect() {
    const { remote } = this.state

    return (
      <div className="connect spotify">
        <a href="/spotify/auth" className="button">
          <img src={spotifyLogo} alt=""/> Connect Spotify
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
          <img src={githubLogo} alt=""/> Connect GitHub
        </a>
        <div className="status">
          {remote ? (
            remote.githubUser ? `✔ Connected as ${remote.githubUser.login}!`
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
        Currently active: {pair.active ? 'yes': 'no'} <a href="#" onClick={() => this._setRemotePair({ active: !pair.active })}>{pair.active ? '[pause syncing]' : '[resume syncing]'}</a><br/>
        Sync explicit songs? {pair.syncExplicit ? 'yes': 'no'} <a href="#" onClick={() => this._setRemotePair({ syncExplicit: !pair.syncExplicit })}>[toggle]</a><br/>
      </span>
    </div>
  }
}
