const express = require('express')
const TimeAgo = require('javascript-time-ago')
const loki = require('lokijs')
const en = require('javascript-time-ago/locale/en')
const path = require('path')
const knex = require("@mueller-splash-pad/knex");

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')
const app = express()
app.use(express.json());
const PORT = process.env.PORT || 5000

const db = new loki('local.db');

const twentyFourHoursAgo = () => (new Date) - 60 * 60 * 1000 * 24

const getParkLocation = (key) => (
  {
    'bartholomew': { latitude: 30.305177, longitude: -97.697469 },
    'chestnut': { latitude: 30.277067251010195, longitude: -97.71699243984315 },
    'eastwoods': { latitude: 30.290943, longitude: -97.731715 },
    'liz-carpenter': { latitude: 30.26211031582992, longitude: -97.75441430399374 },
    'lott': { latitude: 30.271041206071896, longitude: -97.7297671152558 },
    'metz': { latitude: 30.252258120681006, longitude: -97.71810034083994 },
    'mueller-branch-park': { latitude: 30.300190, longitude: -97.702812 },
    'ricky-guerrero': { latitude: 30.247392178325605, longitude: -97.76433234845857 },
    'rosewood': { latitude: 30.27109617907063, longitude: -97.71390894361079 },
  }[key]
)



class DBStatusRepository {

  async addOnVote(weight, parkName) {
    const park_id = (await knex.select('id').from('parks').where({ name: parkName }).first()).id
    for (var i = 0; i < weight; i++)
      await knex('votes').insert({ status: true, park_id })
  }

  async addOffVote(weight, parkName) {
    const park_id = (await knex.select('id').from('parks').where({ name: parkName }).first()).id
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

  async getStatus(parkKey) {
    return { status: "unknown", workingVotes: 0, notWorkingVotes: 0 }

    const workingVotes = this.votes.count({ status: true, timestamp: { $gte: twentyFourHoursAgo() }, parkKey })
    const notWorkingVotes = this.votes.count({ status: false, timestamp: { $gte: twentyFourHoursAgo() }, parkKey })

    if (workingVotes === 0 && notWorkingVotes === 0) {
      const orderedVotes = this.votes.chain().find({ parkKey }).simplesort('timestamp', { desc: true }).data()
      if (orderedVotes.length === 0 || orderedVotes[0].status === false) {
        return { status: "unknown", workingVotes, notWorkingVotes }
      } else {
        return { status: "working", workingVotes, notWorkingVotes }
      }
    }

    if (workingVotes === notWorkingVotes) {
      return { status: "unknown", workingVotes, notWorkingVotes }
    } else if (workingVotes > notWorkingVotes) {
      return { status: "working", workingVotes, notWorkingVotes }
    } else {
      return { status: "not working", workingVotes, notWorkingVotes }
    }
  }
}


class InMemoryStatusRepository {
  constructor() {
    this.votes = db.addCollection('votes');
  }

  async addOnVote(weight, parkKey) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: true, timestamp: new Date(), parkKey })
  }

  async addOffVote(weight, parkKey) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: false, timestamp: new Date(), parkKey })
  }

  async getLastVoteTime(parkKey) {
    const voteDates = this.votes
      .find({ timestamp: { $gte: twentyFourHoursAgo() }, parkKey })
      .map(v => v.timestamp)

    if (voteDates.length > 0)
      return timeAgo.format(voteDates.reduce(function (a, b) { return a > b ? a : b; }))

    return 'N/A'
  }

  async getStatus(parkKey) {
    const workingVotes = this.votes.count({ status: true, timestamp: { $gte: twentyFourHoursAgo() }, parkKey })
    const notWorkingVotes = this.votes.count({ status: false, timestamp: { $gte: twentyFourHoursAgo() }, parkKey })

    if (workingVotes === 0 && notWorkingVotes === 0) {
      const orderedVotes = this.votes.chain().find({ parkKey }).simplesort('timestamp', { desc: true }).data()
      if (orderedVotes.length === 0 || orderedVotes[0].status === false) {
        return { status: "unknown", workingVotes, notWorkingVotes }
      } else {
        return { status: "working", workingVotes, notWorkingVotes }
      }
    }

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

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
