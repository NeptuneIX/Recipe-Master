const passport = require('passport');
// A strategy is the method by which a user is authenticated, localStrategy allows us to create our own
const localStrategy = require('passport-local').Strategy;
const User = require('./user');

passport.serializeUser((user, done) => {
    // Serialize the user ID to the session
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Deserialize the user ID from the session and retrieve the user object
    User.findById(id)
        .then(user => {
            done(null, user); // Pass the user object to the done callback
        })
        .catch(err => {
            done(err, null); // Pass any errors to the done callback
        });
});


// Logic of the aforementioned strategy
passport.use(new localStrategy(function(username, password, done) {
    // Find an account based on the username, then check whether the inputted password is the same as it 
    User.findOne({username: username}).then(doc => {
        // Once an account with the username is found, check if the (hashed)password there is the same as the one we typed in
        if(doc) {
            const valid = doc.comparePassword(password, doc.password);
            if(valid) {
                done(null, doc);
            } else {
                done(null, false);
            }
        } else {
            done(null, false);
        }
    })
    .catch(err => {
        done(err);
    });
    
    
    
    
}));

module.exports = passport;

