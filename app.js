/*  EXPRESS SETUP  */

const express = require('express');
const app = express();
const passport = require('passport');

const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

let User = null;
let voteUser = null
var id_;
let username = '';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to support JSON bodies


app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/css/images/', express.static('./css/images'));

app.use(passport.initialize());
app.use(passport.session());

//getting first page
app.get('/', (req, res) => {
  res.render('auth');
});

/*MOngoose setup*/
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/java_dbs');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String,
});
const votesdetail = new Schema({
  vote: String
});
const UserDetails = mongoose.model('userinfo', UserDetail, 'userinfo');
const votesdetails = mongoose.model('votes', new Schema(
  {
    id: String,
    vote: parseInt(String)
  })
);



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

app.post('/',
  passport.authenticate('local', { failureRedirect: '/error' }),
  function (req, res) {
    username = req.user.username;
    res.redirect('/success?username=' + username);
  });

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    cb(err, user);
  });
});


//error redirection when login fail
app.get('/error', (req, res) => res.send("error logging in"));


//second page redirection
app.get('/success', (req, res) => UserDetails.find({ "username": username }, (err, doc) => {
  User = doc[0].toObject();
  res.render('details', { 'details': User });

})
);
//Third page redirection
app.get('/vote', (req, res) => UserDetails.find({ "username": username }, (err, doc) => {
  User = doc[0].toObject();
  res.render('vote', { 'vote': User });
})
);
//updating vote counts
app.post('/end', (req, res) => {
  id_ = req.body.candidates;


  res.redirect('/end?candidate=' + id_);

});

app.get('/end', (req, res) => votesdetails.findOneAndUpdate({ name: id_ }, { $inc: { vote: 1 } }, { new: true }, function (err, response) {
  if (err) {
    console.log("some error founded");
  } else {
    console.log("data saved");
    res.render('end');
  }
})
)


app.listen(port, () => console.log('App listening on port ' + port));