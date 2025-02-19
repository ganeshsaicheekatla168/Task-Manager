import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/users/user.service';

@Component({
  selector: 'app-login',
  imports: [ButtonModule,InputTextModule,RouterLink,ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string | null =null;
  passwordVisible:boolean = false;
  constructor(private fb: FormBuilder,private userService:UserService , private router:Router) {
    // Initialize the form group with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email validation
      password: ['',[Validators.required]], // Password validation
      remember: [false], // Remember me checkbox, default value is false
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      // Simulating success (In real-world, you would authenticate with an API)
      const userLoginData = {'email':this.loginForm.value.email , 'password':this.loginForm.value.password}
      const response =  this.userService.signIn(userLoginData);
      response.subscribe({
        next: (loginData) => {
         
          // Handle successful login
          if (loginData.success) {
            console.log('Login successful:', loginData.data);
            // You can store the token or handle further login actions, e.g., navigation to another page
            this.userService.setLoginStatus(true);
            this.userService.setUserInfo(loginData.data);
            
             this.loginForm.reset();
             this.router.navigate(['/dashboard']); // Navigate to a protected route
          } 
        },
        error: (err) => {
          // Handle HTTP or network errors
          console.error('Error during login:', err);

          this.errorMessage = err.error.error.substring(13);
          setTimeout(() => {
            this.errorMessage='';
             }, 4000);
          
        },
        complete: () => {
          // Optional: code to execute when the HTTP request completes, successful or not
          console.log('Login attempt completed');
        }
      });
  
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
    }
  }

}
