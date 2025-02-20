import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users/user.service';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  loginStatus: boolean = false;
  loginUserName:string = '';
  
 

 

  constructor(private userService:UserService){
    
  }

  ngOnInit(): void {
  
  
    this.loginUserName = this.userService.getUserInfo().first_name;

    this.loginStatus = this.userService.getLoginStatus();
      if(!this.loginStatus){
        this.userService.clearUserData();
      }
  }
 
}
