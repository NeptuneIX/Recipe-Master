import { HttpClient, HttpHeaders  } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { User } from './user-interface';
import { Status } from "./status-interface";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class authService {
  
    // Used for updating the front end, status implies a boolean value & process signifies from which process it's being updated (eg. signing up successfuly it is process: "signup")
    currentStatus: Status =  {status: "", process: ""};
    currentStatusObservable: Subject<Status> = new Subject<Status>;
    
    resetStatus() {
      this.currentStatus = {status: "", process: ""};
      this.currentStatusObservable.next(this.currentStatus);
    }
    constructor(private httpClient: HttpClient, private router: Router) {
    }

    // Services used for interacting with our authentication back end

    // Sign Up
    // 1) Store username & password as an object & pass it in the POST request where it will be converted to JSON (as req.body)
    // 2) Perform POST request, update "current status" observable to give information to the user about the result.
    // 3) In case of any error, handle that in the other callback function
    signUp(username: string, password: string) {
      const postData = {
        username: username,
        password: password
      };
      this.httpClient.post<{ message: string, userStatus: string }>('http://recipemasterapi.duckdns.org/auth/signUp', postData).subscribe(response => {
        // Logic of showing result of HTTP request to the frontend
        this.currentStatus = {status: `${response.userStatus}`, process: "signup"};
        this.currentStatusObservable.next(this.currentStatus);
      },
      error => {
        console.error('Error occurred during HTTP request:', error);
          
        this.currentStatus = {status: "false", process: "signup"};
        this.currentStatusObservable.next(this.currentStatus);
      });
    }


    // Log In
    // Same principles as sign up
    logIn(username: string, password: string) {
      const postData = {
        username: username,
        password: password
      };
      // { withCredentials: true } is needed for sessions in passport.js to function properky and req.isAuthenticated() to work
      this.httpClient.post<{message: string, userStatus: string}>('http://recipemasterapi.duckdns.org/auth/logIn', postData, { withCredentials: true }).subscribe(response => {
         // Logic of showing result of HTTP request to the front end
         this.currentStatus = {status: `${response.userStatus}`, process: "login"};
         this.currentStatusObservable.next(this.currentStatus);
      },
      error => {
        console.error('Error occurred during HTTP request:', error);
          
        this.currentStatus = {status: "false", process: "login"};
        this.currentStatusObservable.next(this.currentStatus);
      })
    }

    logOut() {
      // { withCredentials: true } is needed for sessions in passport.js to function properky and req.isAuthenticated() to work
      this.httpClient.get<{message: string, userStatus: string}>('http://recipemasterapi.duckdns.org/auth/logOut', { withCredentials: true }).subscribe(response => {

         // Logic of showing result of HTTP request to the front end
        this.currentStatus = {status: `${response.userStatus}`, process: "logout"};
        this.currentStatusObservable.next(this.currentStatus);
        // Navigate to default page upon logging out
        this.router.navigate(['']);
      },
      error => {
        console.error('Error occurred during HTTP request:', error);
          
        this.currentStatus = {status: "false", process: "logout"};
        this.currentStatusObservable.next(this.currentStatus);
      })
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

    // Function for checking whethere there is a current session(user)
    checkAuthState(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        // Check if the user is authenticated
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
