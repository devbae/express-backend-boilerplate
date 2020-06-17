var express = require('express');
var app = express();
var passport = require('passport');
var session = require("express-session");
var bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(session({ secret: "foobar" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session())

app.get('/', function (req, res) {
  res.send('Backend Boilerplate!');
});

// passport login
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {

    res.redirect('/users/' + req.user.username);
});


app.listen(3000, function () {
  console.log('App listening on port 3000!');
});