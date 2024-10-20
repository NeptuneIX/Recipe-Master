import { HttpClient, HttpHeaders  } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Recipe } from './recipe-interface'
import { Router } from "@angular/router";

// This is how we make this a service
@Injectable({
  providedIn: 'root'
})

// Use as needed when implementing various functionalities
// { withCredentials: true } is required for the request to get the current session from passport.js

export class AppService {

  constructor(private httpClient: HttpClient, private router: Router) {}
  
  // Active recipe for recipe-details
  currentRecipe: Recipe = {} as Recipe;
  currentRecipeObservable: Subject<Recipe> = new Subject<Recipe>;


  
  // List of recipes shown on recipe-search
  recipeList: Array<Recipe> = [];
  recipeListObservable: Subject<Recipe[]> = new Subject<Recipe[]>;

  // List of recipes shown on user's saved recipes list (profile-recipes)
  savedRecipeList: Array<Recipe> = [];
  savedRecipeListObservable: Subject<Recipe[]> = new Subject<Recipe[]>;

  // Pagination is handled by updating this value & passing it in getRecipeList
  curPage: number = 1;

  subscribeCurrentRecipe() {
    return this.currentRecipeObservable.asObservable();
  }
  
  subscribeRecipeList() {
    return this.recipeListObservable.asObservable();
  }

  subscribeSavedRecipesList() {
    return this.savedRecipeListObservable.asObservable();
  }


  // Get & update recipes from backend
  getRecipeList() {
    // CurPage is always kept updated and reset, we handle that elsewhere though
   this.httpClient.get<{message: string, recipes: any}>('http://recipemasterapi.duckdns.org/api/getRecipes/' + this.curPage).subscribe(result => {
     this.recipeList = result.recipes;
    this.recipeListObservable.next([...this.recipeList]);
   }, // If we get a status 4xx it executes this instead
    error => {
    this.recipeList = [];
    this.recipeListObservable.next([...this.recipeList]);
   })
  }

  // Get saved recipes from CURRENT user
  getSavedRecipeList() {
   this.httpClient.get<{message: string, recipes: any}>('http://recipemasterapi.duckdns.org/api/getSavedRecipes/' + this.curPage, { withCredentials: true }).subscribe(result => {
      this.savedRecipeList = result.recipes;
      this.savedRecipeListObservable.next([...this.savedRecipeList]);
    }, // If we get a status 4xx it executes this instead
    error => {
      this.savedRecipeList = [];
      this.savedRecipeListObservable.next([...this.savedRecipeList]);
    });
  }

  // If we need to reset the recipeList
  resetRecipeList() {
    this.recipeList = [];
    this.recipeListObservable.next([...this.recipeList]);
  }

  resetSavedRecipeList() {
    this.savedRecipeList = [];
    this.savedRecipeListObservable.next([...this.savedRecipeList]);
  }

  resetPagination() {
    this.curPage = 1;
  }

  incrementPagination(condition: boolean) {
    if(condition) {
      this.curPage++;
    } else {
      this.curPage--;
    }
  }

  getRecipe(recipeDataId: string) {
    // Get recipe and set it as the current one
    this.httpClient.get<{message: string, recipe: any}>("http://recipemasterapi.duckdns.org/api/getRecipe/" + recipeDataId).subscribe(result => {
      this.currentRecipe = result.recipe;
      this.currentRecipeObservable.next(result.recipe);
    });
  }


  searchRecipes(recipeName: string) {
    this.httpClient.get<{message: string, searchResults: any}>('http://recipemasterapi.duckdns.org/api/searchRecipes/' + recipeName).subscribe(result => {
      // We set the search results to local storage & we can retrieve them later
      localStorage.setItem("searchResults", JSON.stringify(result.searchResults));
      // Fix this later, you need to somehow make the results appear  on recipe-search while having it follow its other logic
      this.router.navigate(["recipes"]);
    });
  }

  // This method will return a promise, because we need the RESULT message of the HTTP request to update the front end accordingly
  postRecipe(recipeDetails: Recipe): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // We put the recipe in a FormData because it supports FILES
      const postData = new FormData();
      postData.append("name", recipeDetails.name);
      postData.append("summary", recipeDetails.summary);
      postData.append("steps", recipeDetails.steps);
      postData.append("ingredients", recipeDetails.ingredients);
      postData.append("image", recipeDetails.image);
      
      // Call authRequest function to check authentication state, only then proceed with the request.

      this.authRequest().then(authState => {
        if(authState) {
          this.httpClient.post<{message: string, recipe: any}>('http://recipemasterapi.duckdns.org/api/createRecipe', postData, { withCredentials: true }).subscribe(response => {
            // Just update the recipeList observable on our front end by getting it from the backend
            this.getRecipeList()
            resolve(true);
          });
        }
        if(!authState) {
          resolve(false);
        }
      });
      
    });
  }


  getUsername(): Promise<string> {
    // Since an HTTP get request is async we return a promise that will eventually return the result
    return new Promise((resolve, reject) => {
      // { withCredentials: true } is needed for sessions in passport.js to function properky and req.isAuthenticated() to work
      this.httpClient.get<{ message: string, username: string, userStatus: string }>('http://recipemasterapi.duckdns.org/auth/getSessionUsername', { withCredentials: true })
        .subscribe(
          response => {
            resolve(response.username); // Resolve the promise with the username
          },
          error => {
            console.error('Error occurred during HTTP request:', error);
            reject(error); // Reject the promise with the error
          }
        );
    });
  }



  // Delete recipe using its ID
  deleteRecipe(recipeId: string) {
    // First check if the user is authenticated, only then proceed with the actual request.
    this.authRequest().then(authState => {
      if(authState) {
        this.httpClient.delete<{message: string}>('http://recipemasterapi.duckdns.org/api/deleteRecipe/' + recipeId, {withCredentials: true}).subscribe(response => {
          this.getRecipeList();
        });
      }
    });
    
  }

  // Save recipe to account
  saveRecipe(recipeId: string) {
    const postData = {
      recipeId: recipeId
    };
    // First check if the user is authenticated, only then proceed with the actual request.
    this.authRequest().then(authState => {
      if(authState) {
        this.httpClient.post<{message: string}>('http://recipemasterapi.duckdns.org/auth/saveRecipe', postData, { withCredentials: true }).subscribe(response => {
          
        },
        error => {
          
        });
      }
    });
  }
  // Remove saved recipe from account
  removeSavedRecipe(recipeId: string) {
    const postData = {
      recipeId: recipeId
    };
    // First check if the user is authenticated, only then proceed with the actual request.
    this.authRequest().then(authState => {
      if(authState) {
        this.httpClient.post<{message: string}>('http://recipemasterapi.duckdns.org/auth/removeSavedRecipe', postData, { withCredentials: true }).subscribe(response => {
          // Since we can only perform this action from there, reload that page
          this.router.navigate(['recipes']);
        },
        error => {
        });
      }
    });
  }

  // Check whether recipe is saved
  checkRecipeSavedStatus(recipeId: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const postData = {
        recipeId: recipeId
      };
      this.httpClient.post<{message: string}>('http://recipemasterapi.duckdns.org/auth/checkRecipeSavedStatus', postData, { withCredentials: true }).subscribe(response => {
        resolve(true);
      },
      error => {
        resolve(false);
      });
    })
  }

  // Function for checking whether there is an active session, returns a promise that will inevitably get fulfilled with either true or false
  authRequest(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if the user is authenticated, only then proceed with the actual request
      this.httpClient.get<{message: string}>('http://recipemasterapi.duckdns.org/auth/authRequest', { withCredentials: true }).subscribe(response => {
        resolve(true);
      },
      error => {
        console.error('Error occurred during HTTP request:', error);
        resolve(false);
      });
    })
  }
}
