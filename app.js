/*  EXPRESS SETUP  */

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/css/images/', express.static('./css/images'));


//getting first page
app.get('/', (req, res) => { res.render('auth'); });


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));

/*  PASSPORT SETUP  */

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());



app.get('/success', (req, res) => UserDetails.find({"username":username},function(err, document) {
  res.render('details',{'details': document});
  console.log(document);
})
);


app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    cb(err, user);
  });
});


/* MONGOOSE SETUP */

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/java_dbs');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String,
});
const UserDetails = mongoose.model('userinfo', UserDetail, 'userinfo');


/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    UserDetails.findOne({
      username: username
    }, function (err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));
var username;
app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function (req, res) {
    username=req.user.username;
    res.redirect('/success?username=' + req.user.username);
  });