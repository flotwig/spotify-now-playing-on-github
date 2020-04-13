import axios from 'axios'

type GitHubOpts = {
  apiUrl: string
}

export type GitHubUser = {
  id: string
  login: string
  status: GitHubUserStatus
}

export type GitHubUserStatus = {
  emoji: string
  message: string
  // organizationId: string
  // limitedAvailability: boolean
  // expiresAt: string
  updatedAt: string
}

type GitHubGraphQlResponse<D> = {
  errors?: any
  data: D
}

type GitHubChangeUserStatusResponse = GitHubGraphQlResponse<{
  changeUserStatus: {
    status: GitHubUserStatus
  }
}>

type GitHubGetViewerResponse = GitHubGraphQlResponse<{
  viewer: GitHubUser
}>

function escapeString(str: string) {
  return str.replace(/"/g, '\\"')
}

export function create({ apiUrl }: GitHubOpts) {
  const send = (accessToken: string, query: string) => {
    const authorization = `bearer ${accessToken}`
    return axios.post(`${apiUrl}`, { query }, { headers: { authorization }})
    .then((res) => {
      const data: GitHubGraphQlResponse<any> = res.data

      if (data.errors) {
        throw new Error(`errors from github API: ${JSON.stringify(data)}`)
      }

      return data.data
    })
  }

  return {
    getUser: (accessToken): Promise<GitHubUser> => {
      return (send(accessToken, `query {
        viewer {
          id
          login
          status {
            emoji
            message
            updatedAt
          }
        }
      }`) as Promise<GitHubGetViewerResponse['data']>)
      .then(data => {
        return data.viewer
      })
    },

    setUserStatus: (accessToken, { emoji, message }: Partial<GitHubUserStatus>): Promise<GitHubUserStatus> => {
      return (send(accessToken, `mutation {
        changeUserStatus(input: { emoji: "${escapeString(emoji)}", message: "${escapeString(message)}" }) {
          status {
            emoji
            message
            updatedAt
          }
        }
      }`) as Promise<GitHubChangeUserStatusResponse['data']>)
      .then(data => {
        return data.changeUserStatus.status
      })
    },
  }
}

export type GitHubApi = ReturnType<typeof create>
