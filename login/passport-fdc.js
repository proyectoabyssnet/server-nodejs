var port = process.env.PORT || 3000;
var fs = require('fs');
var express = require('express');
var passport = require('passport')
  , OAuthStrategy = require('passport-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use('provider', new OAuthStrategy({
    tokenURL: 'https://login.salesforce.com/services/oauth2/token',
    authorizationURL: 'https://login.salesforce.com/services/oauth2/authorize',
    clientID: '{YOURCONSUMERKEY}',
    clientSecret: '{YOURPRIVATEKEY}',
    callbackURL: 'http://localhost:'+port+'/token'
  },
  function(token, tokenSecret, profile, done) {
    return done(null, {id: token});
  }
));

var app = express.createServer();
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'thissecretrocks' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.get('/', 
  function(req, res) {
    res.send('Hello World.');
  });

app.get('/login', passport.authenticate('provider'),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

app.get('/token', passport.authenticate('provider', { failureRedirect: '/error' }),
  function(req, res){
    res.send('Logged In.');
  });


app.get('/error', function(req, res){
  res.send('An error has occured.');
  });

app.listen(port, function() {
  console.log("Listening on " + port);
});