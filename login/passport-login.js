var express = require('express')
  , passportFacebook = require('passport')
  , passportTwitter = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , mysql = require('mysql')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , crypto = require('crypto')
  , server = 'http://localhost'
  , path = '/html5/games/client/';

var client = mysql.createClient({
  user: 'tor',
  password: 'tor',
  database: 'test',
  port: 3306,
});

var FACEBOOK_APP_ID = "178287175611294"
var FACEBOOK_APP_SECRET = "0cc0aa3b7d9fc74776c8dab9fd7e79d6";
var TWITTER_CONSUMER_KEY = "gBaYmNLgLqB6jAvP19VgA"
var TWITTER_CONSUMER_SECRET = "nrIaOBpU6XztwsSXCX1ZwQ2pttDnEGSED4MckfzTI";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passportFacebook.serializeUser(function(user, done) {
  done(null, user);
});

passportFacebook.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passportFacebook.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: server+":3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passportTwitter.serializeUser(function(user, done) {
  done(null, user);
});

passportTwitter.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passportTwitter.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: server+":3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passportFacebook.initialize());
  app.use(passportFacebook.session());
  app.use(passportTwitter.initialize());
  app.use(passportTwitter.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

//-------****** REGISTER-USER ******-------

app.get('/singup', function(req, res){
  res.render('singup', { user: req.user });
});

app.post('/register', function(req, res){
   var username = req.body.username
   var password = req.body.password
   var e_mail = req.body.email
    sing_up(username, password, e_mail, function(err, user) {

        if (user) {
            console.log("OK. \n");
            res.render('register', { user: req.user });
        }
        else {
            console.log("Error. \n");
            res.render('error', { user: null });
        }	

    });
});

function sing_up(username, password, e_mail, call) {
    hash = crypto.createHmac('sha1', 'Asdf123@').update(password).digest('hex');
    client.query(
    'INSERT INTO users(name, pass, email) VALUES("'+username+'","'+hash+'","'+e_mail+'")',	
	function(error, results) {
		if(error) {
            console.log("Error al ingresar los datos. \n");
			console.log("\nError: " + error);
			call(null, null);
			return;
		} else {
			var user = true;
            console.log("Ok, los datos han sido ingresados. \n");
            call(null, user);
            return;
			}
		}
	);
};

//-------****** REGISTER-USER ******-------

//-------****** PASSPORT-LOCAL ******-------

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(server+path+'estacion.html');
  });

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure.  Otherwise, return the authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (user.password != password) { return done(null, false); }
        return done(null, user);
      })
    });
  }
));

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
*/

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure.  Otherwise, return the authenticated `user`.
      authenticate(username, function(err, user) {
	    hash = crypto.createHmac('sha1', 'Asdf123@').update(password).digest('hex');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (user.password != hash) { return done(null, false); }
        return done(null, user);
      })
    });
  }
));

function authenticate(username, callback) {
    client.query(
    'SELECT id_user AS id, name AS username, pass AS password FROM users ' +
	'WHERE name = "' +username+ '" LIMIT 1',
	function(error, results) {
		if(error) {
			logger.error(error);
			console.log("\nError: " + error);
		} else {
			var user = results[0];
			if (!user) {
				callback(null, null);
				return;
			} else {
			    callback(null, user);
			    return;
			}
		}
	});
};

//-------****** PASSPORT-LOCAL ******-------


// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passportFacebook.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passportFacebook.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
// GET /auth/twitter
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Twitter authentication will involve redirecting
//   the user to twitter.com.  After authorization, the Twitter will redirect
//   the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passportTwitter.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

// GET /auth/twitter/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback', 
  passportTwitter.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
