import { Component, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { AppService } from '../../app-service';
import { Recipe } from 'src/app/recipe-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-recipes',
  templateUrl: './profile-recipes.component.html',
  styleUrls: ['./profile-recipes.component.css']
})
export class ProfileRecipesComponent implements OnInit, OnDestroy {
  recipeList: Array<Recipe> = [];
  curPage: number = 1;


  constructor(public appService: AppService, private router: Router) {
    

  }

  ngOnInit() {
    this.appService.savedRecipeListObservable.subscribe(recipes => {
      // Update current recipes
      this.recipeList = recipes;

      this.appService.authRequest().then(authenticated => {
        const backButton = document.getElementsByClassName('backButton')[0];
        const nextButton = document.getElementsByClassName('nextButton')[0];
        const noRecipesMessage = document.getElementsByClassName('no-recipes-message')[0];
        const noAuthMessage = document.getElementsByClassName('no-auth-message')[0];
        if(authenticated) {
          // 1) Toggle the message for no recipes depending if we have/don't have recipes
          // 2) Handle pagination
          // Just in case it's been removed
          noAuthMessage.classList.add("hidden");
          // No Recipes message
          if(this.recipeList.length < 1) {
            noRecipesMessage.classList.remove("hidden");
          } else {
            noRecipesMessage.classList.add("hidden");
          }
    
          // Next button 
          if(this.recipeList.length < 11) {
            nextButton.classList.add("hidden");
          } else {
            nextButton.classList.remove("hidden");
          }
    
          // Back button
          if(this.appService.curPage === 1) {
            backButton.classList.add("hidden");
          } else {
            backButton.classList.remove("hidden");
          }
        }
        if(!authenticated) {
          noAuthMessage.classList.remove("hidden");
        }
      })

    });
    
    this.appService.getSavedRecipeList();  
    
  }

  // Reset pagination as every component uses the same one(due to the fact that this is not a big project)
  ngOnDestroy(): void {
    this.appService.resetPagination();
    this.appService.resetSavedRecipeList();
  }

  // Handling the next and back button pagination using this function
  // First increment/decrement, then get recipes once again
  incrementPage(condition: boolean) {
    this.appService.incrementPagination(condition);
    this.appService.getSavedRecipeList();
    // Update "Page {}" to represent the change on the front end
    this.curPage = this.appService.curPage;
  }

  searchRecipes() {
    // So when we finish the user part of our app we will instead call "this.userService" 
    // & call a method that returns either the SAVED recipes or the recipes from that user ( we can possibly get this data by having a parameter in the URL, or a cookie, session etc)
    this.appService.getSavedRecipeList();
  }

  getRecipe(recipeData: Recipe) {
    this.appService.getRecipe(recipeData._id);
  }

  deleteRecipe(event: Event, id: string) {
    event.stopPropagation();
    this.appService.deleteRecipe(id);
  }

  removeSavedRecipe(event: Event, id: string) {
    event.stopPropagation();
    this.appService.removeSavedRecipe(id);
  }

  routeToRecipe(id: string) {
    this.router.navigate(['recipes', 'item', id]);
  }
}
