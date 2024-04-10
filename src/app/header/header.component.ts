import { Component, Input, OnInit } from '@angular/core';
import { AppService } from '../app-service';
import { authService } from '../auth/auth-service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  protected username: string = ""
  constructor(private appService: AppService, private authService: authService) {}
  
  // Log in and sign up button disappear once authenticated and vise versa
  switchAuthFields(value: boolean) {
    const loginBtn = document.querySelector("#loginBtn")?.parentElement?.parentElement;
    const signupBtn = document.querySelector("#signupBtn")?.parentElement?.parentElement;
    const logoutBtn = document.querySelector("#logoutBtn")?.parentElement?.parentElement;
    const welcomeMsg = document.querySelector("#welcomeMsg");

    if(value) {

      loginBtn?.classList.add("hidden");
      signupBtn?.classList.add("hidden");
      logoutBtn?.classList.remove("hidden");
      welcomeMsg?.classList.remove("hidden");
    }
    if(!value) {
      loginBtn?.classList.remove("hidden");
      signupBtn?.classList.remove("hidden");
      logoutBtn?.classList.add("hidden");
      welcomeMsg?.classList.add("hidden");
    }
  }

  fetchUsername(): void {
    // getUsername() returns a promise, so we use .then to follow up on the result of that and update the username
    this.authService.getUsername()
      .then(username => {
        // Assign the received username to the component property
        this.username = username;
        console.log('Received username:', username);
      })
      .catch(error => {
        console.error('Error occurred while fetching username:', error);
      });
  }

  configureFrontEnd(currentStatus: any) {
    console.log(currentStatus);
      
    // Update front end when logging in
    if(currentStatus) {
      this.switchAuthFields(true);
      this.fetchUsername();
    }
    // Update front end when logging out
    if(!currentStatus) {
      this.switchAuthFields(false);
    }
  }

  ngOnInit(): void {
    // When first loading or refreshing, check if there is an authenticated user & update front end
    this.authService.checkAuthState().then(result => {
      console.log("the result is" + result);
      if(result) {
        this.configureFrontEnd(true);
      }
    })
    // Update front end continuously
    this.authService.currentStatusObservable.subscribe(currentStatus => {
      if(currentStatus.process == "login" && currentStatus.status == "true") {
        this.configureFrontEnd(true);
      }
      if(currentStatus.process == "logout" && currentStatus.status == "true") {
        this.switchAuthFields(false);
      }
    });
  }

  logOut(){
    // this.auth bla bla bla, it gets handled internally & update currentStatus as well to reflect the changes
    this.authService.logOut();
  }

  onEnterKeyPress(event: any) {
    this.appService.searchRecipes(event.target.value);
  }

}
