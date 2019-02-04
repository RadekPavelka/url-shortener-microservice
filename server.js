'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();



// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: {type: String, required: true},
  shortened_url: {type: String, required: true}
});

var Url = mongoose.model('Url', urlSchema);


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var urlencodedParser = bodyParser.urlencoded({ extended: false })



app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const dns = require('dns');
const url = require('url'); 


app.post('/api/shorturl/new', urlencodedParser, function (req, res) {
  const parsedUrl = url.parse(req.body.url);
  dns.lookup(parsedUrl.hostname, (err, address) => {
    if(err) {
      console.log("error happened " + err.code);
      res.json({"error":"invalid URL"});
    } else if (address == null) {
      console.log("unknown error");
      res.json({"error":"invalid URL"});
    } else {
      console.log(address);
      const url = new Url({original_url: req.body.url, shortened_url: Math.floor(Math.random() * 100)});
      url.save().then(result => { console.log(result) }).catch(err => console.log(err));
      res.json({"original_url": req.body.url, "shortened_url": url.shortened_url});                 
  }})});    

app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl
  Url.findOne({shortened_url: shortUrl})
  .exec()
  .then(url => {
    console.log(url);
    if (url) {
      res.redirect(url.original_url);
    }
    else {
      res.status(404);
    }
  })
  .catch(err => res.status(500).json(err))
});
           
           
  
                           
          /*                 
      var createAndSaveUrl = function(done) {
        var newUrl = new Url({url: req.body.url, shortenedUrl: 1});
        newUrl.save(function(err, data) {
          if (err) done(err);
          done(null, data);
        });
      };
      var findOneByUrl = function(url, done) {
        Url.findOne({url: url}, function(err, data) {
          if(err) {
            done(err);
          }
          done(null, data);
        })
      };
      console.log(findOneByUrl(req.body.url));
      res.json({"original_url": req.body.url, "short_url": findOneByUrl(req.body.url)});
    }
  */


app.listen(port, function () {
  console.log('Node.js listening ...');
});