

const mongoose = require('mongoose');
const recipe = require('../recipe');
const bcrypt = require('bcrypt');

// Connect to DB
async function main() {
    await mongoose.connect(process.env.mongoDB_connection_string).then(() => {
      console.log('Connected to database!');
    }).catch(() => {
      console.log("Connection failed");
    });
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

main().catch(err => console.log(err));

// Create schema for recipe
const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    savedRecipes: {type: Array, required: true}
});

// Add a method to the schema to encrypt the password
userSchema.methods.hashPassword = function(password) {
    console.log(password);
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};
// Method for comparing a password with a corresponding hashed password  
userSchema.methods.comparePassword = function(password, hash) {
    return bcrypt.compareSync(password, hash);
}
// Method for pushing a saved recipe ID on a particular user
userSchema.methods.saveRecipe = function(recipeId) {
    // Check if the recipeId is already saved to prevent duplicates
    if (!this.savedRecipes.includes(recipeId)) {
        this.savedRecipes.push(recipeId);
        return this.save(); // Save changes to the database
    }
    return Promise.resolve(this); // Return a resolved promise if recipeId is already saved
}
// Method for removing a saved recipe ID on a particular user
userSchema.methods.removeRecipe = function(recipeId) {
    this.savedRecipes = this.savedRecipes.filter(id => id != recipeId);
    return this.save(); // Save changes to the database
}

// Create a "model" that we can use with our DB!
const user = mongoose.model('User', userSchema);




// Export it so that we can use it in express
module.exports = user;
