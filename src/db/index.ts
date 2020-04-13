import { Sequelize } from 'sequelize'
import * as PairModel from './pair'

type DbOpts = {
  dbUrl: string
}

export type Pair = PairModel.Pair

export type Db = {
  Pair: typeof PairModel.Pair
}


export function create({ dbUrl }: DbOpts): Db {
  const sequelize = new Sequelize(dbUrl, { dialect: 'postgres' })

  const Pair = PairModel.init(sequelize)

  sequelize.sync()

  return { Pair }
}
