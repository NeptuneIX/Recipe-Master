import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeSearchComponent } from './recipes/recipe-search/recipe-search.component';
import { RecipeDetailsComponent } from './recipes/recipe-details/recipe-details.component';
import { RecipeCreateComponent } from './recipes/recipe-create/recipe-create.component';
import { AuthSignupComponent } from './auth/auth-signup/auth-signup.component';
import { AuthLoginComponent } from './auth/auth-login/auth-login.component';
import { ProfileRecipesComponent } from './personal-profile/profile-recipes/profile-recipes.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

const routes: Routes = [
  {path: '', component: WelcomePageComponent},
  {path: 'recipes', component: RecipeSearchComponent},
  {path: 'recipes/item/:id', component: RecipeDetailsComponent},
  {path: 'profile/savedRecipes', component: ProfileRecipesComponent},
  {path: 'profile/userRecipes/:id', component: ProfileRecipesComponent},
  {path: 'profile/createRecipe', component: RecipeCreateComponent},
  {path: 'auth/signup', component: AuthSignupComponent},
  {path: 'auth/login', component: AuthLoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
