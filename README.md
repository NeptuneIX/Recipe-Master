# 🍲 Full-Stack Recipe App built with Angular, MongoDB, Express & Node.js

This app is a full-stack recipe management system where users can log in, explore recipes, create their own, and save their favorites for easy access. Built with Angular for the front end, Express and Node.js for the backend, and MongoDB as the database, it also uses Azure for file storage and Passport.js for session-based authentication.

## Features

- **Explore Recipes:** Browse a diverse collection of recipes uploaded by users. Deletion privileges are limited to the creator.
- **Create Your Own:** After logging in, users can create and upload a new recipe with a custom title, summary, image, ingredients, and cooking steps.
- **Save Favorites:** Authorized users can save recipes to their personal collection for quick access.
- **Sign Up & Log In:** Secure account creation and login functionality. Passport.js is used for user session management to ensure secure access to all features.

## How It Works

1. **Sign Up or Log In:** Start by creating an account or logging in to access all features.
2. **Browse Recipes:** View recipes added by other users, complete with summaries, ingredients, and images.
3. **Create Your Recipe:** Share your own culinary creations. Only you can delete recipes you’ve uploaded.
4. **Save Favorites:** Save preferred recipes to your collection, allowing for easy future access.

## Tech Stack

- **Frontend:** Angular for responsive, dynamic UI components.
- **Backend:** Node.js and Express for server-side logic and API endpoints.
- **Database:** MongoDB for storing user and recipe data.
- **File Storage:** Azure for managing recipe images and static assets.
- **Authentication:** Passport.js with sessions for secure user login and access control.

## Video Overview
[Watch the video overview](https://youtu.be/y74smD8EGnM)


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
