import { Component, OnDestroy } from '@angular/core';
import { OnInit, Renderer2 } from '@angular/core';
import { AppService } from '../../app-service';
import { Recipe } from 'src/app/recipe-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-search',
  templateUrl: './recipe-search.component.html',
  styleUrls: ['./recipe-search.component.css']
})
export class RecipeSearchComponent implements OnInit, OnDestroy {
  recipeList: Array<Recipe> = [];
  curPage: number = 1; 


  constructor(public appService: AppService, private router: Router, private renderer: Renderer2) {
    

  }

  ngOnInit() {
    this.appService.recipeListObservable.subscribe(recipes => {
      // Update current recipes
      this.recipeList = recipes;

      // 1) Toggle the message for no recipes depending if we have/don't have recipes
      // 2) Handle pagination

      const backButton = document.getElementsByClassName('backButton')[0];
      const nextButton = document.getElementsByClassName('nextButton')[0];
      const noRecipesMessage = document.getElementsByClassName('no-recipes-message')[0];
      
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
    });
    
    this.appService.getRecipeList();  
    
  }

  // Reset pagination as every component uses the same one(due to the fact that this is not a big project)
  ngOnDestroy(): void {
    this.appService.resetPagination();
    this.appService.resetRecipeList();
  }
  
  // Handling the next and back button pagination using this function
  // First increment/decrement, then get recipes once again
  incrementPage(condition: boolean) {
    this.appService.incrementPagination(condition);
    this.appService.getRecipeList();
    // Update "Page {}" to represent the change on the front end
    this.curPage = this.appService.curPage;
  }

  // Get recipes
  searchRecipes() {
    this.appService.getRecipeList();
  }

  // Get specific recipe upon click
  getRecipe(recipeData: Recipe) {
    this.appService.getRecipe(recipeData._id);
  }

  // Delete a specific recipe
  deleteRecipe(event: Event, id: string) {
    event.stopPropagation();
    this.appService.deleteRecipe(id);
    
  }

  saveRecipe(event: Event, id: string) {
    event.stopPropagation();
    // Remove save button after clicking it once, you can improve this to set save/remove button depending on if it's already in the user's account but this'll do for now...
    const element = event.target as HTMLElement;
    element?.parentElement?.classList.add("hidden");
    this.appService.saveRecipe(id);
  }
}
