 
 
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/users/user.service';
 
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
 
 
 
@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink,FormsModule,CommonModule,ButtonModule, TableModule,
     ToastModule, InputTextModule, MultiSelectModule, FormsModule,
    ToastModule,ReactiveFormsModule],
 
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers:[MessageService]
})
export class ForgotPasswordComponent {
  
  forgotPasswordForm!: FormGroup;
  
    constructor(private fb: FormBuilder,private router : Router , private userService : UserService,private messageService:MessageService){}
    
    ngOnInit(): void {
      this.createForm();
    }
  
    // Create form with validators
    createForm() {
      this.forgotPasswordForm = this.fb.group({
        email: [
          '',
          [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")]
        ]
      });
    }
    
    SendEmail(){
      console.log(this.forgotPasswordForm.value.email);
        this.userService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
          next: (response) => {
            this.forgotPasswordForm.reset();
              this.showMessage();
              console.log("Email sent successfully to update password");
          },
          error: (error) => {
              console.log(error);
              this.showError(error.error.error.message);
              console.log("Error while sending the email to update the password");
          }
      });
    }


    showMessage() {
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Reset Link send to your Mail', 
        life: 4000
      });
      setTimeout(() => {
        this.router.navigate(['/login'])
       }, 4000);
    }
  
    // Method to trigger a failure (error) toast message
    showError(message:string) {
      this.messageService.add({ 
        severity: 'error',  // Changed to 'error' for failure messages
        summary: 'Failure', 
        detail: `${message}, Please try again.`, 
        life: 4000  // Message will disappear after 4 seconds
      });
    }
}
