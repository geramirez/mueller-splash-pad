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

const oneHourAgo = () => (new Date) - 60 * 60 * 1000

const getParkLocation = (key) => (
  {
    'mueller-branch-park': { latitude: 30.300190, longitude: -97.702812 },
    'bartholomew': { latitude: 30.305177, longitude: -97.697469 },
  }[key]
)


class StatusRepository {
  constructor() {
    this.votes = db.addCollection('votes');
  }

  addOnVote(weight, parkKey) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: true, timestamp: new Date(), parkKey })
  }

  addOffVote(weight, parkKey) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: false, timestamp: new Date(), parkKey })
  }

  getLastVoteTime(parkKey) {
    const voteDates = this.votes
      .find({ timestamp: { $gte: oneHourAgo() }, parkKey })
      .map(v => v.timestamp)

    if (voteDates.length > 0)
      return timeAgo.format(voteDates.reduce(function (a, b) { return a > b ? a : b; }))

    return 'N/A'
  }

  getStatus(parkKey) {
    const workingVotes = this.votes.count({ status: true, timestamp: { $gte: oneHourAgo() }, parkKey })
    const notWorkingVotes = this.votes.count({ status: false, timestamp: { $gte: oneHourAgo() }, parkKey })

    if (workingVotes === 0 && notWorkingVotes === 0) {
      const orderedVotes = this.votes.chain().simplesort('timestamp', { desc: true }).data()
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


const statusRepository = new StatusRepository()

app.get('/status/:parkKey', (req, res) => {
  const parkKey = req.params.parkKey
  const { status, workingVotes, notWorkingVotes } = statusRepository.getStatus(parkKey)
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime(parkKey) })
})


app.post('/status/:parkKey', (req, res) => {
  const { vote, location } = req.body
  const parkKey = req.params.parkKey
  console.log(vote, location, parkKey)
  const parkLocation = getParkLocation(parkKey)
  if (vote === 'on')
    statusRepository.addOnVote(calculateVoteWeight(parkLocation, location), parkKey)
  else if (vote === 'off')
    statusRepository.addOffVote(calculateVoteWeight(parkLocation, location), parkKey)
  const { status, workingVotes, notWorkingVotes } = statusRepository.getStatus(parkKey)
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime(parkKey) })
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
