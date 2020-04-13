import * as Sequelize from 'sequelize'
import { GitHubUserStatus } from '../github'
import { pickBy, pick } from 'lodash'

type RequiredPairProps = Pick<Pair, 'spotifyUniqueId' | 'spotifyToken' | 'spotifyRefreshToken' | 'githubUniqueId' | 'githubToken'>

export class Pair extends Sequelize.Model<Pair> {
  public spotifyUniqueId!: string
  public spotifyToken!: string
  public spotifyRefreshToken!: string
  public githubUniqueId!: string
  public githubToken!: string
  public lastManualStatus!: GitHubUserStatus | null
  public lastManualStatusWasNull!: boolean
  public lastNowPlayingAt!: Date | null
  public lastCheckedAt!: Date | null
  public syncs!: number
  public active!: boolean

  public readonly createdAt!: Date;

  static createFromUniqueIds (props: RequiredPairProps & Partial<Pair>) {
    return Pair.findOrCreate({
      where: pickBy(pick(props, 'githubUniqueId', 'spotifyUniqueId')),
      defaults: {
        ...props,
      }
    }).then(([pair]) => {
      pair.set(props)

      return pair.save()
    })
  }

  static getActive () {
    return Pair.findAll({ where: { active: true }})
  }
}

export function init(sequelize: Sequelize.Sequelize) {
  Pair.init({
    spotifyUniqueId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    spotifyToken: {
      type: Sequelize.STRING,
      allowNull: false
    },
    spotifyRefreshToken: {
      type: Sequelize.STRING,
      allowNull: false
    },
    githubUniqueId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    githubToken: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastStatus: {
      type: Sequelize.STRING,
      allowNull: true
    },
    lastManualStatus: {
      type: Sequelize.JSON,
      allowNull: true
    },
    lastManualStatusWasNull: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    lastNowPlayingAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    lastCheckedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    syncs: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'pairs',
    updatedAt: false,
    sequelize
  })

  return Pair
}
