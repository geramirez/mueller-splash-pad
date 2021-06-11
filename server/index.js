const express = require('express')
const TimeAgo = require('javascript-time-ago')
const loki = require('lokijs')
const en =  require('javascript-time-ago/locale/en')

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')
const app = express()
app.use(express.json());
const PORT = process.env.PORT || 5000

const db = new loki('local.db');

const oneHourAgo = () => (new Date) - 60 * 60 * 1000


class StatusRepository {
  constructor() {
    this.votes = db.addCollection('votes');
  }

  addOnVote(weight) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: true, timestamp: new Date() })
  }

  addOffVote(weight) {
    for (var i = 0; i < weight; i++)
      this.votes.insertOne({ status: false, timestamp: new Date() })
  }

  getLastVoteTime() {
    const voteDates = this.votes
      .find({ timestamp: { $gte: oneHourAgo() } })
      .map(v => v.timestamp)

    if (voteDates.length > 0)
      return timeAgo.format(voteDates.reduce(function (a, b) { return a > b ? a : b; }))

    return 'N/A'
  }

  getStatus() {
    const workingVotes = this.votes.count({ status: true, timestamp: { $gte: oneHourAgo() } })
    const notWorkingVotes = this.votes.count({ status: false, timestamp: { $gte: oneHourAgo() } })
    this.votes.findAndRemove({ timestamp: { $lt: oneHourAgo() } })
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


const calculateVoteWeight = (location) => {
  const branchParkLocation = { latitude: 30.300190, longitude: -97.702812 }
  if (location === undefined)
    return 1
  if (arePointsNear(location, branchParkLocation, .2))
  return 2
  return 1
}


const statusRepository = new StatusRepository()

app.get('/status', (_, res) => {
  const { status, workingVotes, notWorkingVotes } = statusRepository.getStatus()
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime() })
})


app.post('/status', (req, res) => {
  const { vote, location } = req.body
  console.log(vote, location)
  if (vote === 'on')
    statusRepository.addOnVote(calculateVoteWeight(location))
  else if (vote === 'off')
    statusRepository.addOffVote(calculateVoteWeight(location))
  const { status, workingVotes, notWorkingVotes } = statusRepository.getStatus()
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime() })
})


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})