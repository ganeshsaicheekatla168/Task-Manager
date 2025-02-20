import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../../services/users/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,RouterOutlet,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  loginStatus:boolean =false;

  constructor(private userService:UserService){}


  ngOnInit(): void {
    this.loginStatus = this.userService.getLoginStatus();
  }

}
