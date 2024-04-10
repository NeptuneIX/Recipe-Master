import { Component, OnDestroy } from '@angular/core';
import { Recipe } from 'src/app/recipe-interface';
import { OnInit } from '@angular/core';
import { AppService } from '../../app-service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
  currentRecipe: Recipe = {} as Recipe;
  public id: any;

  constructor(public appService: AppService, private route: ActivatedRoute, private router: Router) {

  }

  
  // Get ID for the selected recipe & retrieve from backend 
  ngOnInit() {
    // This gets called in eventually this.getRecipe is executed
    this.appService.subscribeCurrentRecipe().subscribe(recipe => {
      this.currentRecipe = recipe;

      // Add button for removing from saved recipes list if said recipe is saved to user's account
      const saveButton = document.getElementsByClassName('save-recipe')[0];
      const removeButton = document.getElementsByClassName('remove-recipe')[0];

      this.appService.checkRecipeSavedStatus(this.currentRecipe._id).then(result => {
        if(result) {
          removeButton.classList.remove("hidden");
          saveButton.classList.add("hidden");
        } else {
          removeButton.classList.add("hidden");
          saveButton.classList.remove("hidden");
        }
      })
    })

    // Get the id we passed down from recipe-search when routing to here & set it to currentRecipe
    this.id = this.route.snapshot.paramMap.get('id');
    this.getRecipe(this.id);

    
  }
  
  ngOnDestroy(): void {
    this.appService.resetRecipeList();
  }
  
  searchRecipes() {
    this.appService.getRecipeList();
  }
  
  getRecipe(id: string) {
    // We make a call to the back end & afterwards the subscription in ngOnInit is activated
    this.appService.getRecipe(id);
  }

  deleteRecipe() {
    this.appService.deleteRecipe(this.currentRecipe._id);
    this.router.navigate(["recipes"]);
  }

  saveRecipe() {
    this.appService.saveRecipe(this.currentRecipe._id);
    this.router.navigate(['recipes']);
  }

  viewUserRecipes() {
    const userId = this.currentRecipe.userId;
    // Then we have something like this
    // this.router.navigate(["profile/userRecipes", userId]);
  }

  
}
