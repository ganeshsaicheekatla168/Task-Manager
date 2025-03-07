
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/users/user.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';



@Component({
  selector: 'app-reset-password',
  imports: [ButtonModule, CommonModule, FormsModule, InputTextModule, ToastModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService]
})
export class ResetPasswordComponent {
  token: string | null = "";
  resetPasswordForm!: FormGroup;

  constructor(private router: Router, private UserService: UserService, private route: ActivatedRoute, private messageService: MessageService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log('Token from URL:', this.token);
    // Initialize form group with validators
    this.resetPasswordForm = this.fb.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#%$!&*])[a-zA-Z0-9#%$!&*]{8,}$')
        ]
      ],
      confirmPassword: ['', Validators.required]
    });
  }

  onResetPassword() {
    console.log(`token : ${this.token}`)
    if (this.resetPasswordForm.valid && this.token) {
      console.log('Request Payload:', { token: this.token, newPassword: this.resetPasswordForm.value.newPassword });
      this.UserService.resetPassword(this.token, this.resetPasswordForm.value.newPassword).subscribe((response) => {
        this.showMessage();
      }, (error) => {
        console.log(error)
      })
      console.log(`reset password is clicked : ${this.resetPasswordForm.value.newPassword}`)
    }
    else {
      this.showError("Unable to reset password");
    }
  }


  showMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password Reseted, Redirecting to Login Page...',
      life: 2000
    });
    setTimeout(() => {
      this.router.navigate(['/login'])
    }, 2000);
  }

  // Method to trigger a failure (error) toast message
  showError(message: string) {
    this.messageService.add({
      severity: 'error',  // Changed to 'error' for failure messages
      summary: 'Login Failed',
      detail: `${message}, Please try again.`,
      life: 4000  // Message will disappear after 4 seconds
    });
  }

}