const express = require('express')
const loki = require('lokijs')


const app = express()
app.use(express.json());
const PORT = process.env.PORT || 3000

app.use(express.static('public'));


const db = new loki('local.db');

const oneHourAgo = () => (new Date) - 60 * 60 * 1000


class StatusRepository {
  constructor() {
    this.votes = db.addCollection('votes');
  }

  addOnVote() {
    this.votes.insertOne({ status: true, timestamp: new Date() })
  }

  addOffVote() {
    this.votes.insertOne({ status: false, timestamp: new Date() })
  }

  getLastVoteTime() {
    const voteDates =  this.votes
      .find({timestamp: { $gte: oneHourAgo() } })
      .map(v => v.timestamp)

    if(voteDates.length > 0)
      return voteDates.reduce(function (a, b) { return a > b ? a : b; })
    return 'N/A'
  }

  getStatus() {
    const workingVotes = this.votes.count({ status: true, timestamp: { $gte: oneHourAgo() } })
    const notWorkingVotes = this.votes.count({ status: false, timestamp: { $gte: oneHourAgo() } })
    this.votes.findAndRemove({timestamp :{ $lt: oneHourAgo() }})
    if (workingVotes === notWorkingVotes) {
      return {status: "unknown", workingVotes, notWorkingVotes}
    } else if (workingVotes > notWorkingVotes) {
      return {status: "working", workingVotes, notWorkingVotes}
    } else {
      return {status: "not working", workingVotes, notWorkingVotes}
    }
  }
}


const statusRepository = new StatusRepository()

app.get('/status', (req, res) => {
  const {status, workingVotes, notWorkingVotes} = statusRepository.getStatus()
  res.json({ status , votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime(), voted: false })
})


app.post('/status', (req, res) => {
  if (req.body.vote === 'on')
    statusRepository.addOnVote()
  else if (req.body.vote === 'off')
    statusRepository.addOffVote()
  const {status, workingVotes, notWorkingVotes} = statusRepository.getStatus()
  res.json({ status, votes: { working: workingVotes, not_working: notWorkingVotes }, updated_at: statusRepository.getLastVoteTime(), voted: true })
})


app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})