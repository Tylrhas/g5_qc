var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var crawl = require('./app/controllers/crawl.js')
var dictionary = require('./app/controllers/custom-dictionary.js')
var models = require("./app/models")

app.set('views', './app/views');
app.set('view engine', 'ejs');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// For BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('pages/index', { user: req.user });
});

app.post('/crawl', function (req, res) {
    // load up the Custom Dictionary
    var words = dictionary.load()
    words.then(function (words) {
        crawl.crawl(req.body.url, req, res, words)
    })
});


app.get('/dictionary', function (req, res) {
    // load up the Custom Dictionary
    var words = dictionary.load()
    words.then(function (words) {
        res.json(words)
    })
})

app.post('/dictionary/add', function(req, res){
    console.log(req.body)
    //add word to the custom dictionary
    dictionary.add(req.body.add).then(function(newDictionary){
        res.json(newDictionary)
    })
})

app.post('/dictionary/remove', function(req, res){
    //add word to the custom dictionary
    dictionary.remove(req.body.remove).then(function(newDictionary){
        res.json(newDictionary)
    })
})

app.listen(app.get('port'), function () {
    console.log('QC App is running on port', app.get('port'))
});


//Sync Database
models.sequelize.sync().then(function () {
    console.log('Nice! Database looks fine');
    //load the custom dict
}).catch(function (err) {
    console.log(err, "Something went wrong with the Database Update!")
});