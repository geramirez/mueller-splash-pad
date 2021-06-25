const express = require('express')
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en')
const path = require('path')
const knex = require("@mueller-splash-pad/knex");
const R = require('ramda')

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')
const app = express()
app.use(express.json());
const PORT = process.env.PORT || 5000


const twentyFourHoursAgo = () => (new Date) - 60 * 60 * 1000 * 24

const getParkLocation = R.memoizeWith(
  R.identity,
  async (parkName) => await knex.select('latitude', 'longitude').from('parks').where({ name: parkName }).first()
)

class DBStatusRepository {

  constructor() {
    this.getParkId = R.memoizeWith(R.identity, async parkName => (await knex.select('id').from('parks').where({ name: parkName }).first()).id)
  }

  async addOnVote(weight, parkName) {
    const park_id = await this.getParkId(parkName)
    for (var i = 0; i < weight; i++)
      await knex('votes').insert({ status: true, park_id })
  }

  async addOffVote(weight, parkName) {
    const park_id = await this.getParkId(parkName)
    for (var i = 0; i < weight; i++)
      await knex('votes').insert({ status: false, park_id })
  }

  async getLastVoteTime(parkName) {

    const park_id = (await knex.select('id').from('parks').where({ name: parkName }).first()).id
    const lastVoteRecord = await knex
      .select('created_at')
      .where({ park_id })
      .where('created_at', '>=', new Date(twentyFourHoursAgo()))
      .from('votes')
      .orderBy('created_at', 'desc')
      .first()

    return lastVoteRecord ? timeAgo.format(lastVoteRecord.created_at) : 'N/A'
  }

  async getStatus(parkName) {
    const park_id = await this.getParkId(parkName)
    const lastVoteRecords = await knex
      .count('status')
      .select('status')
      .where({ park_id })
      .where('created_at', '>=', new Date(twentyFourHoursAgo()))
      .from('votes')
      .groupBy('status')

    if (!lastVoteRecords) {
      const lastVoteRecord = await knex
        .select('status')
        .where({ park_id })
        .from('votes')
        .orderBy('created_at', 'desc')
        .first()
      if (lastVoteRecord && lastVoteRecord.status) {
        return { status: "working", workingVotes: 0, notWorkingVotes: 0 }
      } else {
        return { status: "unknown", workingVotes: 0, notWorkingVotes: 0 }
      }
    }

    const { workingVotes, notWorkingVotes } = lastVoteRecords.reduce((acc, record) => {
      return record.status ?
        { ...acc, workingVotes: parseInt(record.count) } :
        { ...acc, notWorkingVotes: parseInt(record.count) }
    }, { workingVotes: 0, notWorkingVotes: 0 })


    if (workingVotes === notWorkingVotes) {
      return { status: "unknown", workingVotes, notWorkingVotes }
    } else if (workingVotes > notWorkingVotes) {
      return { status: "working", workingVotes, notWorkingVotes }
    } else {
      return { status: "not working", workingVotes, notWorkingVotes }
    }
  }

}

function arePointsNear(checkPoint, centerPoint, km) {
  var ky = 40000 / 360;
  var kx = Math.cos(Math.PI * centerPoint.latitude / 180.0) * ky;
  var dx = Math.abs(centerPoint.longitude - checkPoint.longitude) * kx;
  var dy = Math.abs(centerPoint.latitude - checkPoint.latitude) * ky;
  return Math.sqrt(dx * dx + dy * dy) <= km;
}


const calculateVoteWeight = (parkLocation, location) => {
  if (location === undefined)
    return 1
  if (arePointsNear(location, parkLocation, .2))
    return 2
  return 1
}


const statusRepository = new DBStatusRepository()

app.get('/status/:parkKey', async (req, res) => {
  const parkKey = req.params.parkKey
  const { status, workingVotes, notWorkingVotes } = await statusRepository.getStatus(parkKey)
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: await statusRepository.getLastVoteTime(parkKey) })
})


app.post('/status/:parkKey', async (req, res) => {
  const { vote, location } = req.body
  const parkKey = req.params.parkKey
  console.log(vote, location, parkKey)
  if (location) {
    const parkLocation = await getParkLocation(parkKey)
    if (vote === 'on')
      await statusRepository.addOnVote(calculateVoteWeight(parkLocation, location), parkKey)
    else if (vote === 'off')
      await statusRepository.addOffVote(calculateVoteWeight(parkLocation, location), parkKey)
  }
  const { status, workingVotes, notWorkingVotes } = await statusRepository.getStatus(parkKey)
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: await statusRepository.getLastVoteTime(parkKey) })
})

if (process.env.NODE_ENV === 'production') {

  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

  app.get('*', function (_, res) {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });

}

if (process.env.NODE_ENV === "development") {
  app.get("/db_status", async (req, res) => {
    const results = await knex
      .select()
      .from("pg_roles")
      .then((data) => {
        return data;
      });

    res.send(results);
  });
}

app.listen(PORT, async () => {
  await knex.migrate.latest({directory: path.join(__dirname, '..', 'knex', 'migrations')})
  console.log(`Example app listening at http://localhost:${PORT}`)
})
