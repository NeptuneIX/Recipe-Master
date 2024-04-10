import { Component } from '@angular/core';
import { Recipe } from 'src/app/recipe-interface';
import { AppService } from 'src/app/app-service';

@Component({
  selector: 'app-recipe-create',
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.css']
})
export class RecipeCreateComponent {
  recipe: any = {};

  constructor(public appService: AppService) {}

  resetInputFields() {
    document.querySelectorAll('.inputField').forEach((elem) => {;
      if (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement) {
        elem.value = "";
      }
    })
  }

  postRecipe() {
    const incompleteMessage = document.getElementsByClassName('incomplete-message')[0];
    const failureMessage = document.getElementsByClassName('failure-message')[0];
    const successMessage = document.getElementsByClassName('success-message')[0]; 
    // Only move forward if all the fields are filled
    if(!this.recipe.ingredients || !this.recipe.steps || !this.recipe.summary || !this.recipe.name || !this.recipe.image) {
      incompleteMessage.classList.remove('hidden');
      successMessage.classList.add("hidden");
      failureMessage.classList.add("hidden");
    } else {
      
      this.appService.postRecipe(this.recipe).then(result => {
        if(result) {
          incompleteMessage.classList.add('hidden');
          failureMessage.classList.add("hidden");
          successMessage.classList.remove("hidden");
        } else {
          incompleteMessage.classList.add('hidden');
          successMessage.classList.add("hidden");
          failureMessage.classList.remove("hidden");
        }
      })
      .catch(error => {
        console.error('Error occurred while fetching username:', error);
      });;

      // We must reset the input fields visually and internally
      this.resetInputFields();
      this.recipe = {};
    }
  }

  isFileTypeAllowed(fileType: string): boolean {
    // Define allowed file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    // Check if the file type is in the allowed types
    return allowedTypes.includes(fileType);
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];

    // Check if the selected file type is allowed
    if (file && this.isFileTypeAllowed(file.type)) {
      console.log('File selected:', file);
      this.recipe.image = file;
    } else {
      console.error('Invalid file type. Please select a valid image (jpg, jpeg, png).');
    }
  }
}
