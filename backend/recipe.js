

const mongoose = require('mongoose');

// Connect to DB
async function main() {
    await mongoose.connect('mongodb+srv://NeptuneIX:Ue2Qy48VpWAoj5PS@cluster0.dm1zltx.mongodb.net/').then(() => {
      console.log('Connected to database!');
    }).catch(() => {
      console.log("Connection failed");
    });
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

main().catch(err => console.log(err));

// Create schema for recipe
const recipeSchema = mongoose.Schema({
    name: {type: String, required: true},
    summary: {type: String, required: true},
    steps: {type: String, required: true},
    ingredients: {type: String, required: true},
    userId: {type: String, required: true},
    image: {type: String, required: true}
});

// Create a "model" that we can use with our DB!
const recipe = mongoose.model('Recipe', recipeSchema);


// Export it so that we can use it in express
module.exports = recipe;