import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/users/user.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent{

  registerForm: FormGroup;
  toastMessage:string='';
  successMessage:boolean =false;
  errorMessage:boolean = false;
  passwordVisible:boolean =false;
  constructor(private userService:UserService) {
    this.registerForm = new FormGroup({
      'first_name': new FormControl(null, [
        Validators.required,
        Validators.maxLength(35),
        Validators.pattern('^[a-zA-Z].*')  // Starts with an alphabet
      ]),
      'last_name': new FormControl(null, [
        Validators.required,
        Validators.maxLength(35),
        Validators.pattern('^[a-zA-Z].*')  // Starts with an alphabet
      ]),
      'email': new FormControl(null, [
        Validators.required,
        Validators.email,  // Standard email validation
        // You can add a custom validator for uniqueness (though that requires backend integration)
      ]),
      'password': new FormControl(null, [
        Validators.required,
        Validators.maxLength(8),
        Validators.pattern('^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#%$!&*])[a-zA-Z0-9#%$!&*]{8}$')
        ]),
      'terms': new FormControl(false, Validators.requiredTrue), // This is the terms checkbox control
    });    
  }


  clearToastmsg(){
    this.toastMessage='';
    this.successMessage=false;
    this.errorMessage = false;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Handle form submission here try {
      try{
        console.log(this.registerForm.value);
        delete this.registerForm.value.terms;
        console.log(this.registerForm.value);
        const emailExistsResponse =  this.userService.signup(this.registerForm.value);
        emailExistsResponse.subscribe({
          next :(response)=>{
             // Call your service to register the user
             console.log(response);
             this.registerForm.reset();
             this.toastMessage='User Registration Successfull';
             this.successMessage=true;
             setTimeout(() => {
                    this.clearToastmsg();
              }, 4000);
             
          
          },
          error :async (err)=>{
            // this.signUpFailed.status = true;
            // this.signUpFailed.message=err.error.error;
            this.toastMessage = err.error.error;
            this.errorMessage = true;
            setTimeout(() => {
              this.clearToastmsg();
            }, 5000);
            console.log(err);
          }
        })
      } catch (error) {
        console.error('Error during signup:', error);
        alert('Error during signup. Please try again.');
      }
      
    } else {
      // Handle form invalid case
      console.log('Form is not valid');
    }
  }


}
