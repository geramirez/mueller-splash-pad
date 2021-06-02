const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'));


app.get('/status', (req, res) => {
    res.json({ status: 'not working', votes: {working: 1, not_working: 0}, updated_at: new Date() })
})


app.post('/status', (req, res) => {
  res.json({ status: 'working', votes: {working: 1, not_working: 0}, updated_at: new Date() })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})