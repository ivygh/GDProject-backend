//backend_login.app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');


//MongoDB connection
const mongoUriTest  = 'mongodb+srv://gradediggers:KyunEwaHIp83UtbC@ivywschun.9dr1qud.mongodb.net/test';
const sessionSecretTest = 'abcdefg';

mongoose.connect(mongoUriTest);


//Express Application Setup
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //Parse JSON bodies

//Session Configration
app.use(session({
  secret: sessionSecretTest,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: mongoUriTest // Use environment variable
  })
}));

//Passport Configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());


//Route handlers
app.post('/register', function (req, res) {
  User.register(
    new User({ 
      email: req.body.email, 
      username: req.body.username 
    }), req.body.password, function (err, msg) {
      if (err) {
        res.send(err);
      } else {
        res.send({ message: "Successful" });
      }
    }
  )
})


app.post('/login', passport.authenticate('local', { 
  failureRedirect: '/login-failure', 
  successRedirect: '/login-success'
}), (err, req, res, next) => {
  if (err) next(err);
});

app.get('/login-failure', (req, res, next) => {
  // console.log(req.session);
  res.send('Login Attempt Failed.');
});

app.get('/login-success', (req, res, next) => {
  // console.log(req.session);
  res.send('Login Attempt was successful.');
});


app.get('/profile', function(req, res) {
  // console.log(req.session)
  if (req.isAuthenticated()) {
    res.json({ message: 'You made it to the secured profie' })
  } else {
    res.json({ message: 'You are not authenticated' })
  }
});

//Server initialization
const Port = process.env.PORT || 5000;
app.listen(Port, () => console.log("Server is running on port 5000"));
