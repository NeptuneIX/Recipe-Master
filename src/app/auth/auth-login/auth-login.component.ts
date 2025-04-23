import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { authService } from '../auth-service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css']
})
export class AuthLoginComponent implements OnDestroy, OnInit {
  
  // Updating front end about authentication status
  // In order to unsubscribe to prevent issues later on, we use a variable for our subscription for updating the front end auth status
  private statusSubscription: Subscription | undefined;
  private statement1: any;
  private statement2: any;

  constructor(public authService: authService) {} 

  // This will handle updating the status of the HTTP result with the front end, using a subject from authService
  ngOnInit(): void {
    
    this.statusSubscription = this.authService.currentStatusObservable.subscribe(currentStatus => {
      this.statement1 = document.querySelector("#statement1");
      this.statement2 = document.querySelector("#statement2");
      // Toggle as necessary every time the status is changed
      if(currentStatus.status == "true" && currentStatus.process == "login") {
        this.statement1?.classList.add("hidden");
        this.statement2?.classList.remove("hidden");

      }
      else if(currentStatus.status == "false" && currentStatus.process == "login") {
        this.statement1?.classList.remove("hidden");
        this.statement2?.classList.add("hidden");
      } else {
        this.statement1?.classList.add("hidden");
        this.statement2?.classList.add("hidden");
      }
    })
  }

  ngOnDestroy(): void {
    this.authService.resetStatus();
    this.statusSubscription?.unsubscribe();
  }

  logIn(formData: any): void {
    const username = formData.username;
    const password = formData.password;
    
    this.authService.logIn(username, password);
  }
}
