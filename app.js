//Importing  necessary libraries
const express = require('express')
require('./db/mongoose.js')
const exphbs = require('express-handlebars')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require("express-session")
const bodyParser = require("body-parser")
const bcrypt = require('bcryptjs')

const User = require('./models/user.js')


//===============EXPRESS=================
const app = express();
app.use(express.json());
app.use(session({ secret: "foobar" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session())

var hbs = exphbs.create({
  defaultLayout: 'main',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


//===============PASSPORT=================
passport.serializeUser(function (user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

passport.use('local-sign-in', new LocalStrategy(
  {
    usernameField: 'email',
    passReqToCallback: true
  },
  async (req, username, password, done) => {
    try {
      let user = await User.findByCredentials(username, password)
      if (user) {
        req.session.success = 'You are successfully logged in ' + user.email + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.';
        done(null, user);
      }
    } catch (e) {
       done(e)
    }

  }
));

passport.use('local-signup', new LocalStrategy(
  {
    usernameField: 'email',
    passReqToCallback: true
  },
  async (req, username, password, done) => {
    try {
      password = await bcrypt.hashSync(password, 8)
      const user = new User({ email: username, password: password })
      await user.save()
      req.session.success = 'You are successfully registered and logged in ' + user.email + '!';
      done(null, user);
    } catch (e) {
      done(e)
    }
  }
));

//===============ROUTES=================
app.get('/', function (req, res) {
  res.render('home', { user: req.user });
});

app.get('/signin', function (req, res) {
  res.render('signin');
});

app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
})
);

app.post('/login', passport.authenticate('local-sign-in', {
  successRedirect: '/',
  failureRedirect: '/signin'
})
);

app.get('*', (req, res) => {
  res.send('Page not available')
})


app.listen(3000, function () {
  console.log('App listening on port 3000!');
});