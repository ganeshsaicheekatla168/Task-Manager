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

  constructor(private http: HttpClient, private router: Router) {
    // Initialize user info from localStorage if available
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      this.userInfo = JSON.parse(storedUser);
      this.loginStatus = true;  // User is logged in if there's user info in localStorage
    }
  }

  // Example method to register the user
  signup(user: any): Observable<{ success: boolean; data: any; error: string }> {
    return this.http.post<{ success: boolean; data: {}; error: string }>(
      `${this.apiUrl}/add`, user
    );
  }

  // Sign In method
  signIn(user: any, rememberme: boolean): Observable<{ success: boolean; data: { user_id: string; first_name: string; email: string; token: string }; error: string }> {
    return this.http
      .post<{ success: boolean; data: { user_id: string; first_name: string; email: string; token: string }; error: string }>(
        `${this.apiUrl}/login?rememberme=${rememberme}`,
        { email: user.email, password: user.password } // Assuming the user object contains email and password
      );
  }

  getAllUsersNamesAndIds(): Observable<{ success: boolean; data: [{ first_name: string, _id: string }]; error: string }> {
    // Retrieve the JWT token from localStorage or wherever you have it stored
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean; data: [{ first_name: string, _id: string }]; error: string }>(`${this.apiUrl}/getNamesAndIDs`, { headers });
  }

  getAllUsersNamesAndIdsBySearch(start: string, limit: number, search: string): Observable<{ success: boolean; data: { first_name: string; _id: string }[]; error: string }> {
    let params: any = {};

    if (start) params.start = start;
    if (limit) params.limit = limit;
    if (search) params.search = search;
    // Retrieve the JWT token from localStorage or wherever you have it stored
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ success: boolean; data: { first_name: string; _id: string }[]; error: string }>(
      `${this.apiUrl}/getSearchUsers`,
      { headers, params }
    );
  }

  // Set the login info status
  setLoginStatus(status: boolean) {
    this.loginStatus = status;
  }

  // Get the login info status
  getLoginStatus() {
    return this.loginStatus;
  }

  //is Expired
  // Function to decode a JWT
  decodeJWT(token: string) {
    // JWT structure: <header>.<payload>.<signature>
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  // Function to check token expiration
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
      return true; // No token in localStorage, consider it expired
    }

    const decodedToken = this.decodeJWT(token);
    const expTime = decodedToken.exp; // expiration time from the decoded JWT

    // Compare expTime with current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    return currentTime >= expTime; // If current time is greater than or equal to expTime, token is expired
  }

  // Set the user info
  setUserInfo(user: any) {
    this.userInfo = user;
    this.setLoginStatus(true);
    // Save user info to localStorage to persist across page reloads
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    localStorage.setItem('loginStatus', 'true');
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

  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email })
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword })
  }


}
