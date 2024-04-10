const express = require("express");
const {ObjectId} = require('mongodb');
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const app = express();
const recipeSchema = require('./recipe');
const fs = require('fs');

// Acceptable mime types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  // This is the callback called when deciding the destination
  destination: (req,file,cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  // This is the callback called when creating the filename
  filename: (req,file,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
    }
});
const upload = multer({storage:storage});


// Cors is needed if we call requests in the backend(localhost:3000) from the frontend(localhost:4200) 
// When we use sessions with passport.js, we need credentials to equal true and pass {withCredentials: true} when calling any request!
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true, // Enable credentials (cookies, authorization headers)
  "Access-Control-Allow-Credentials": true
}));

// Notices whenever we receive JSON data, then processes it
app.use(express.json());


// If we try to get the image just with the URL it won't let us
// we need to do this to allow such requests
app.use("/images", express.static(path.join("backend/images")));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Authentication system using passport.js, based on sessions

// Import this to use sessions using passport
const session = require ("express-session");
// Configure passport in a different file to keep everything tidy
const passport = require("./auth/passport");
const recipe = require("./recipe");
// authRoutes takes passport as an argument & uses it
const authRoutes = require("./auth/auth")(passport);

// Store sessions in MongoDB database
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: 'mongodb+srv://NeptuneIX:Ue2Qy48VpWAoj5PS@cluster0.dm1zltx.mongodb.net/', // MongoDB connection URI
  databaseName: "test",
  collection: 'sessions' // MongoDB collection to store sessions
});

// Configuring & initializing passport.js
app.use(session({
  secret: 'd8a6b7e7f6c5c2af8d1e0b3a2e9c5d7b4f7d5a2e0c4b9a1e3f0c9d1b8e2a5',
  resave: false,
  saveUninitialized: false,
  store: store, // Use MongoDBStore for session storage
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Session expiration time (optional)
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());



// Routing for auth requests
app.use('/auth', authRoutes);


// Check auth status (for debugging)
app.use('/', (req, res, next) => {
  
  next();
});



// In our angular component, this gets called after the request above is finished
app.post('/api/createRecipe', upload.single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const newRecipe = new recipeSchema({
    name: req.body.name,
    summary: req.body.summary,
    steps: req.body.steps,
    ingredients: req.body.ingredients,
    image: url + "/images/" + req.file.filename,
    userId: req.user._id.toString()
  });
    

    
  // Mongoose schema allows us to easily save this object to the DB
  newRecipe.save().then(recipe => {
    res.status(201).json({
      message: "Successfuly saved recipe.",
      recipe: recipe 
    });
  })
  .catch(err => {
      console.error(err);
      res.status(500).json({
      error: err.message
    });
  });
});

app.get("/api/getRecipe/:id", (req, res, next) => {
  
  // We need to transform our id using ObjectId so that we can filter by it
  const recipeId = new ObjectId(req.params.id);
  recipeSchema.findOne({_id: recipeId}).then(result => {
    if(result) {
      res.status(202).json({
        message: "Successfully found recipe.",
        recipe: result
      });
    } else {
      res.status(404).json({
        message: "Recipe not found.",
        recipe: ''
      })
    } 
  });
});

app.get('/api/getRecipes/:curPage', (req,res,next) => {
  // This is needed for pagination 
  let pageNum = req.params.curPage;

  // 10 + 1 because we need to check whethere there are more than the 10 display on page to decide front end button placements
  recipeSchema.find().skip((pageNum-1)*10).limit(11).then(result => {
    if(result.length > 0) {
      res.status(202).json({
        message: "Successuly obtained the recipes.",
        recipes: result
      });
    } else {
      res.status(404).json({
        message: "Failure in getting recipes",
        recipes: ''
      })
    } 
  });
});

app.get('/api/getSavedRecipes/:curPage', (req,res,next) => {
  let pageNum = req.params.curPage;
  let recipeIdList = [...req.user.savedRecipes.values()];
  // When on the initial page pageNum is 1
  // Therefore we need from 0 to 10, then from 10 to 20 etc 

  // + 1 because we need to check whethere there are more than the 10 display on page to decide front end button placements
  recipeIdList = recipeIdList.slice((pageNum-1)*10, (pageNum*10)+1);

  // Use the IDs to search our recipe model(&in takes an array and checks for each one)
  recipeSchema.find({_id: {$in: recipeIdList}}).then(result => {
    if(result.length > 0) {
      res.status(202).json({
        message: "Successuly obtained the user's recipes.",
        recipes: result
      });
    } else {
      res.status(404).json({
        message: "User has no saved recipes.",
        recipes: ''
      })
    } 

  });
});

app.get('/api/searchRecipes/:searchQuery', (req, res, next) => {
  
  let searchQuery = req.params.searchQuery.split(" ");
  // $all allows us to check if multiple words are present in the name, the regular expression helps in cases of case-insenstive matching
  // Eg. if there's "vanilla" in a recipe & we've typed "Vanilla" the regex makes the capital V irrelevant in terms of searching
  recipeSchema.find({ name: { $all: searchQuery.map(keyword => new RegExp(keyword, 'i')) } }).then(results => {
    if(results.length > 0) {
      res.status(202).json({
        message: "Successfuly found",
        searchResults: results
      });

    } else {
      res.status(404).json({
        message: "Not found",
        searchResults: ''
      });
    }})
});

// pls fix this later, deleteOne works but idk how to delete it from the backend/images here
app.delete('/api/deleteRecipe/:id', (req, res, next) => {
  const recipeId = req.params.id;
  // Self explanatory, if there's no recipe or there's no authroization
  let allIsOK = true;

  // Find the recipe by ID
  recipeSchema.findById(recipeId)
    .then(recipe => {
      
      if (!recipe) {
        allIsOK = false;
        res.status(404).json({ message: 'Recipe not found' });
      }
      if(recipe.userId != req.user._id.toString()) {
        allIsOK = false;
        res.status(401).json({ message: 'User not authorized.' });
      }
      // Extract filename from image URL
      const filename = recipe.image.split('images/')[1];
      
        
      // Delete the image file from the file system
      if(allIsOK) {
        fs.unlink('./backend/images/' + filename, (err) => {
          if (err) {
            console.error(err);
            allIsOK = false;
            res.status(500).json({ error: 'Failed to delete image file' });
          }
        });
      }
    }).then(() => {
      // If there hasn't been any errors, proceed to delete recipe.
      if(allIsOK) {
        recipeSchema.deleteOne({_id: recipeId}).then(result => {
          if(result.deletedCount > 0) {
       
            res.status(202).json({
              message: "Successfully deleted."
            });
          } else {
            res.status(204).json({
              message: "No document found"
            });
          }
        }).catch(err => {
          res.status(400).json({
            message: "Error deleting!"
          });
        })
      }
    });
    
});





module.exports = app;