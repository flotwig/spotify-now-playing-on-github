import axios from 'axios'

type GitHubOpts = {
  apiUrl: string
}

export type GitHubUser = {
  data: {
      viewer: {
      id: string
      login: string
      status: GitHubUserStatus
    }
  }
}

export type GitHubUserStatus = {
  emoji: string
  message: string
  organizationId: string
  limitedAvailability: boolean
  expiresAt: string
}

export function create({ apiUrl }: GitHubOpts) {
  const send = (accessToken: string, query: string) => {
    const authorization = `bearer ${accessToken}`
    return axios.post(`${apiUrl}`, { query }, { headers: { authorization }})
    .then(res => {
      return res.data
    })
  }

  return {
    getUser: (accessToken): Promise<GitHubUser> => {
      return send(accessToken, `query {
        viewer {
          id
          login
          status {
            emoji
            message
          }
        }
      }`)
    },

    setUserStatus: (accessToken, { emoji, message, organizationId, limitedAvailability, expiresAt}: GitHubUserStatus): Promise<void> => {
      return send(accessToken, `mutation {
        changeUserStatus(input: { emoji: "${emoji}", message: "${message}", organizationId: "${organizationId}", limitedAvailability: ${limitedAvailability}, expiresAt: "${expiresAt}") {
          status {
            emoji
            message
          }
        }
      }`)
    },
  }
}
