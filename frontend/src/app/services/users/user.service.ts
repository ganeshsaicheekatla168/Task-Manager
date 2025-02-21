import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { session } from '../../utils/session';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';  // Example API URL
  private loginStatus = false;
  
  private userInfo = {
    user_id: '',
    first_name: '',
    email: '',
    token: ''
  };

  constructor(private http: HttpClient , private router:Router) {
    // Initialize user info from localStorage if available
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      this.userInfo = JSON.parse(storedUser);
      this.loginStatus = true;  // User is logged in if there's user info in localStorage
    }
  }

  // Example method to register the user
  signup(user: any): Observable<{ success: boolean; data: {}; error: string }> {
    return this.http.post<{ success: boolean; data: {}; error: string }>(
      `${this.apiUrl}/add`, user
    );
  }

  // Sign In method
  signIn(user: any): Observable<{ success: boolean; data: { user_id: string; first_name: string; email: string; token: string }; error: string }> {
    return this.http
      .post<{ success: boolean; data: { user_id: string; first_name: string; email: string; token: string }; error: string }>(
        `${this.apiUrl}/login`,
        { email: user.email, password: user.password } // Assuming the user object contains email and password
      );
  }

  getAllUsersNamesAndIds():Observable<{ success: boolean; data: [{first_name:string , _id:string}]; error: string }>{
    // Retrieve the JWT token from localStorage or wherever you have it stored
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return  this.http.get<{ success: boolean; data: [{first_name:string , _id:string}]; error: string }>(`${this.apiUrl}/getNamesAndIDs`,{headers});
  }

  // Set the login info status
  setLoginStatus(status: boolean) {
    this.loginStatus = status;
  }

  // Get the login info status
  getLoginStatus() {
    return this.loginStatus;
  }

  // Set the user info
  setUserInfo(user: any) {
    this.userInfo = user;
    // Save user info to localStorage to persist across page reloads
    localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    localStorage.setItem('token',this.userInfo.token);
    localStorage.setItem('loginStatus' , 'true');
    this.setLoginStatus(true);  // Set login status to true
  }

  // Get the user info
  getUserInfo() {
    return { email: this.userInfo.email, first_name: this.userInfo.first_name };
  }

  // Logout function to clear user data
  clearUserData() {
    this.userInfo = { user_id: '', first_name: '', email: '', token: '' };
    localStorage.removeItem('userInfo');  // Remove from localStorage
    localStorage.removeItem('loginStatus');
    localStorage.removeItem('token');
    this.setLoginStatus(false);  
    session.loginStatus = false;
    this.router.navigate(['/login']);
  }
  
}
