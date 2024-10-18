const express = require("express");
const {ObjectId} = require('mongodb');
const path = require("path");
const cors = require("cors");
const app = express();
const recipeSchema = require('./recipe');
const fs = require('fs');


// When we use sessions with passport.js, we need credentials to equal true and pass {withCredentials: true} when calling any request!
app.use(cors({
  origin: 'https://recipe-master-eight.vercel.app',
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use((req, res, next) => {
  console.log(req.headers);
  next();
});

// Acceptable mime types
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

// Configure multer to handle file uploads using Azure cloud storage

const multer = require("multer");
const { BlobServiceClient } = require('@azure/storage-blob');

// Set up Azure Blob Storage

// Connection string to authenticate with azure storage blob
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_CONTAINER_NAME = "recipe-images"; // Your Azure container name

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Helper function to upload image to Azure Blob Storage
const uploadFileToAzure = async (buffer, mimetype, originalname) => {
  const blobName = originalname.split(' ').join('-').toLowerCase() + "-" + Date.now() + path.extname(originalname);
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the file to Azure Blob Storage
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimetype } // Set the correct MIME type
  });

  // Return the URL of the uploaded file
  return blockBlobClient.url;
};

// Helper function to delete a blob from Azure Blob Storage
const deleteFileFromAzure = async (filename) => {
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(filename);

  await blockBlobClient.deleteIfExists();
};

// Use Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });



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
  uri: process.env.mongoDB_connection_string, // MongoDB connection URI
  databaseName: "test",
  collection: 'sessions' // MongoDB collection to store sessions
});

// Error handling for the session store
store.on('error', function(error) {
    console.error('Session store error:', error);
});

// Configuring & initializing passport.js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store, // Use MongoDBStore for session storage
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Session expiration time (optional)
    secure: process.env.NODE_ENV === 'production'
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
app.post('/api/createRecipe', upload.single('image'), async (req, res, next) => {
  try {
    // Upload the file to Azure Blob Storage
    const fileUrl = await uploadFileToAzure(req.file.buffer, req.file.mimetype, req.file.originalname);
    
    // Create the recipe object with the URL of the uploaded image from Azure
    const newRecipe = new recipeSchema({
      name: req.body.name,
      summary: req.body.summary,
      steps: req.body.steps,
      ingredients: req.body.ingredients,
      image: fileUrl,  // Use the Azure Blob Storage URL
      userId: req.user._id.toString()
    });

    // Save the new recipe to the database
    newRecipe.save().then(recipe => {
      res.status(201).json({
        message: "Successfully saved recipe.",
        recipe: recipe
      });
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        error: err.message
      });
    });
  } catch (err) {
    console.error("Error uploading file to Azure:", err);
    res.status(500).json({
      error: 'Failed to upload file and create recipe.'
    });
  }
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


app.delete('/api/deleteRecipe/:id', async (req, res, next) => {
  try {
    const recipeId = req.params.id;

    // Find the recipe by ID
    const recipe = await recipeSchema.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the current user is authorized to delete the recipe
    if (recipe.userId !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Extract the filename from the image URL 
    const filename = recipe.image.split('images/')[1];  

    // Delete the image file from azure blob storage
    await deleteFileFromAzure(filename);

    // Delete the recipe document from the database
    const result = await recipeSchema.deleteOne({ _id: recipeId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Successfully deleted recipe and image file from Azure.' });
    } else {
      res.status(404).json({ message: 'No document found for deletion.' });
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Error deleting recipe and/or image file from Azure.' });
  }
});





module.exports = app;
