import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { UserService } from '../../services/users/user.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-signup',
  imports: [FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    RouterLink,
    CommonModule,
    ToastModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  providers:[MessageService]
})
export class SignupComponent{

  registerForm: FormGroup;
  passwordVisible:boolean =false;
  constructor(private userService:UserService,private messageService:MessageService,private router:Router,private fb:FormBuilder) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(35), Validators.pattern('^[a-zA-Z].*')]],
      last_name: ['', [Validators.required, Validators.maxLength(35), Validators.pattern('^[a-zA-Z].*')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#%$!&*])[a-zA-Z0-9#%$!&*]{8}$')]],
      confirm_password: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { 
      validator: this.mustMatch('password', 'confirm_password') 
    });   
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }


  

  onSubmit() {
    delete this.registerForm.value.confirm_password;
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
             this.showMessage();
          },
          error :async (err)=>{

            this.showError(err.error.error);
            console.log(err);
          }
        })
      } catch (error) {
        console.error('Error during signup:', error);
        this.showError(error+"");
        alert('Error during signup. Please try again.');
      }
      
    } else {
      // Handle form invalid case
      this.showError("Form is not valid")
      console.log('Form is not valid');
    }
  }


  showMessage() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Registration Success', 
      detail: 'Redirecting to Login...', 
      life: 3000 
    });
    setTimeout(() => {
      this.registerForm.reset();
      this.router.navigate(['/login']);
     }, 3000);
  }

   // Method to trigger a failure (error) toast message
   showError(message:string) {
    this.messageService.add({ 
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Registration Failed', 
      detail: `${message}, Please try again.`, 
      life: 4000  // Message will disappear after 4 seconds
    });
  }


}
