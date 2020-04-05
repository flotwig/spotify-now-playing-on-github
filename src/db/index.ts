import { Sequelize } from 'sequelize'
import * as PairModel from './pair'

type DbOpts = {
  dbUrl: string
}

export function create({ dbUrl }: DbOpts) {
  const sequelize = new Sequelize(dbUrl, { dialect: 'postgres' })

  const Pair = PairModel.init(sequelize)

  sequelize.sync()

  return { Pair }
}
