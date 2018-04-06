// Express
var express = require('express')
var app = express()

// Models
var models = require('./app/models')

// Passport
var passport = require('passport')
var session = require('express-session')
// For Passport
app.use(session({
  secret: process.env.session_secret,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions

// load passport strategies
require('./app/config/passport.js')(passport, models.user)

// Socket IO
var server = require('http').Server(app)
var io = require('socket.io')(server)

var bodyParser = require('body-parser')
var crawl = require('./app/controllers/crawl.js')
var dictionary = require('./app/controllers/custom-dictionary.js')

app.set('views', './app/views')
app.set('view engine', 'ejs')

// app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
var port = process.env.PORT || 5000
app.use(express.static(__dirname + '/public'))

// For BodyParser
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.render('pages/index', { user: req.user })
})

app.post('/crawl', function (req, res) {
  // load up the Custom Dictionary
  var words = dictionary.load()
  words.then(function (words) {
    crawl.crawl(req.body.url, req, res, words)
  })
})

app.get('/dictionary', function (req, res) {
  // load up the Custom Dictionary
  var words = dictionary.load()
  words.then(function (words) {
    res.json(words)
  })
})

app.post('/dictionary/add', function (req, res) {
  console.log(req.body)
  // add word to the custom dictionary
  dictionary.add(req.body.add).then(function (newDictionary) {
    res.json(newDictionary)
  })
})

app.post('/dictionary/remove', function (req, res) {
  // add word to the custom dictionary
  dictionary.remove(req.body.remove).then(function (newDictionary) {
    res.json(newDictionary)
  })
})

server.listen(port)

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' })
  socket.on('crawl', function (data) {
    enqueue(data.url).then(job => {
      socket.emit('enqueued', job.dataValues)
      var jobQueue = models.jobQueue.findOne({
        where: {
          processing: true
        }
      })
      jobQueue.then(function (jobQueue) {
        if (!jobQueue) {
          console.log('here we go!')
          crawl.crawl(io)
        }
      })
    })
  })
})

// Sync Database
models.sequelize.sync().then(function () {
  console.log('Nice! Database looks fine')
  // load the custom dict
}).catch(function (err) {
  console.log(err, 'Something went wrong with the Database Update!')
})
function enqueue (url) {
  return models.jobQueue.create({url})
}
