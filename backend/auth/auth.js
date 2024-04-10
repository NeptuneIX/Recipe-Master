const express = require("express");
const router = express.Router();
const User = require("./user");



module.exports = function(passport) {

    // Check auth status (for debugging)
    router.use('/', (req, res, next) => {
        next();
    });
    
    // Status is sent over to the front end so that we can update our front end to inform the user about the result of the HTTP request
    router.post('/signUp', (req, res) => {
        try {
            User.findOne({ username: req.body.username }).then(doc => {
                if (doc) {
                    res.status(200).json({
                        message: "User exists.",
                        userStatus: "false"
                    });
                } else {
                    var record = new User();
                    record.username = req.body.username;
                    // Hash password for security reasons
                    record.password = record.hashPassword(req.body.password);
                    record.savedRecipes = [];
                    record.save();
                    res.status(201).json({
                        message: "Successfully signed up.",
                        userStatus: "true"
                    });
                }
            });
        } catch (error) {
            res.status(500).json({
                message: "Error.",
                userStatus: ""
            });
        }
    });
    

    // When logging in use passport to handle authentication and use the 'local' strategy
    // We pass the username and password credentials in req.body as req.body.username and req.body.password,
    // but when calling passport.authenticate it IMPLICITLY extrapolates the 2 mentioned and uses the strategy defined in passport.js
    
    router.post('/logIn', (req, res, next) => {
        // Authenticate the user using Passport's local strategy
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error(err);
                // If there's an error, return a 500 Internal Server Error response
                return res.status(500).json({ message: "Internal server error.", userStatus: "" });
            }
            // If no user is found, authentication failed
            if (!user) {
                return res.status(401).json({ message: "Authentication failed.", userStatus: "false" });
            }
            // Log in the user if authentication is successful
            req.logIn(user, (err) => {
                if (err) {
                    console.error(err);
                    // If there's an error logging in the user, return a 500 Internal Server Error response
                    return res.status(500).json({ message: "Internal server error.", userStatus: "" });
                }
                // Log a message indicating successful authentication
                res.status(202).json({ message: "Successfully authenticated.", userStatus: "true" });
            });
        })(req, res, next);
    });
    
    

    // Self explanatory
    router.get('/logOut', (req, res) => {
        
        // Clear the session cookie
        res.clearCookie('connect.sid');

        // Logout the user
        req.logout(() => {
            // Destroy the session
            req.session.destroy(err => {
                if (err) {
                    res.status(500).json({
                        message: "Error destroying session.", 
                        userStatus: false
                    });
                } else {
                    res.status(200).json({
                        message: "Logged out successfully.", 
                        userStatus: true
                    });
                }
            });
        });
        req.user=null
    
    });


    // Getting the username of the active session
    router.get('/getSessionUsername', (req, res) => {
        try {
            // If the user is authenticated, retrieve the username from req.user
            if (req.isAuthenticated()) {
                const username = req.user.username;
                res.status(200).json({
                    message: "Successfully found username.",
                    username: username, 
                    userStatus: "false"
                });
            } else {
                // If the user is not authenticated, return an empty object or appropriate error response
                res.status(401).json({
                    message: "User not authenticated",
                    username: "", 
                    userStatus: "false"
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Error.", 
                username: "",
                userStatus: "false"
            });
        }
    });

    // Save recipe to current active user
    router.post('/saveRecipe', (req, res) => {
        // Find User
        User.findOne({_id: req.user._id}).then(result => {
            if(result) {
                // Check whether the recipe is already saved 
                if(!result.savedRecipes.includes(req.body.recipeId)) {
                    // Add the recipe to the user data & save
                    result.savedRecipes.push(req.body.recipeId);
                    result.save();
                    res.status(202).json({
                      message: "Successfully saved recipe to current user."
                    });
                } else {
                    res.status(403).json({
                        error: "Recipe already exists in user data."
                    })
                }
              
            } else {
                res.status(404).json({
                    error: "User not found."
                })
            } 
        });
    });
    
    // Remove a recipe from current active user
    router.post('/removeSavedRecipe', (req, res) => {
        // Find User
        User.findOne({_id: req.user._id}).then(result => {
            if(result) {
                // Check whether the recipe is already saved 
                if(result.savedRecipes.includes(req.body.recipeId)) {
                    // Add the recipe to the user data & save
                    result.savedRecipes = result.savedRecipes.filter(item => item != req.body.recipeId);
                    result.save();
                    res.status(202).json({
                      message: "Successfully removed recipe from current user."
                    });
                } else {
                    res.status(403).json({
                        error: "Recipe has not been saved by the user."
                    })
                }
              
            } else {
                res.status(404).json({
                    error: "User not found."
                })
            } 
        });
    });

    // Check whether the current recipe is saved in the current user 
    router.post('/checkRecipeSavedStatus', (req, res) => {
        if(req.isAuthenticated()) {
            // Find User
            User.findOne({_id: req.user._id}).then(result => {
                if(result) {
                    // Check whether the recipe is already saved 
                    if(result.savedRecipes.includes(req.body.recipeId)) {
                        
                        res.status(202).json({
                          message: "Recipe is saved."
                        });
                    } else {
                        res.status(403).json({
                            error: "Recipe is not saved."
                        })
                    }
                  
                } else {
                    res.status(404).json({
                        error: "User not found."
                    })
                } 
            });
        } else {
            res.status(404).json({
                error: "User not authenticated."
            })
        }
    });

    // We check if the user is authenticated
    router.get('/authRequest', (req, res, next) => {
        if(req.isAuthenticated()) {
          res.status(200).json({
            message: "You are authenticated."
          });
        } else {
          res.status(401).json({
            error: "You are not authenticated."
          });
        }
    });

    return router;

    
};