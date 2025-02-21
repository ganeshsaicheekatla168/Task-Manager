import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/users/user.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { session } from '../../utils/session';
@Component({
  selector: 'app-login',
  imports: [ButtonModule,InputTextModule,RouterLink,ReactiveFormsModule
    ,FormsModule,CommonModule,ToastModule
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers:[MessageService]
})
export class LoginComponent implements OnInit{

  loginForm: FormGroup;
  passwordVisible:boolean = false;
  constructor(private fb: FormBuilder,private userService:UserService , private router:Router,private messageService:MessageService) {
    // Initialize the form group with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email validation
      password: ['',[Validators.required]], // Password validation
      remember: [false], // Remember me checkbox, default value is false
    });
  }

  ngOnInit(): void {
   
  }

  

  onSubmit() {
    if (this.loginForm.valid) {
      // Simulating success (In real-world, you would authenticate with an API)
      const userLoginData = {'email':this.loginForm.value.email , 'password':this.loginForm.value.password}
      const response =  this.userService.signIn(userLoginData ,this.loginForm.value.remember);
      response.subscribe({
        next: (loginData) => {
         
          // Handle successful login
          if (loginData.success) {
            console.log('Login successful:', loginData.data);
            // You can store the token or handle further login actions, e.g., navigation to another page
            this.userService.setLoginStatus(true);
            this.userService.setUserInfo(loginData.data);
             this.showMessage();
             session.loginStatus = true;
          } 
        },
        error: (err) => {
          // Handle HTTP or network errors
          console.error('Error during login:', err);
          this.showError(err.error.error.substring(13));
          
        },
        complete: () => {
          // Optional: code to execute when the HTTP request completes, successful or not
          console.log('Login attempt completed');
        }
      });
  
    } else {
      this.showError("Form Data Invalid");
      //this.errorMessage = 'Please fill in all fields correctly.';
    }
  }

  showMessage() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Login Success, Redirecting...', 
      life: 2000 
    });
    setTimeout(() => {
      this.loginForm.reset();
      this.router.navigate(['/home/dashboard']); // Navigate to a protected route
     }, 2000);
  }

   // Method to trigger a failure (error) toast message
   showError(message:string) {
    this.messageService.add({ 
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Login Failed', 
      detail: `${message}, Please try again.`, 
      life: 4000  // Message will disappear after 4 seconds
    });
  }

}
