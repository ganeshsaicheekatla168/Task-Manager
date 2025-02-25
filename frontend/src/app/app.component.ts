import { Component, OnInit } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/users/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
 
  title:string = 'ehr-demo'
  loginStatus:boolean =false;
  constructor(private primeng: PrimeNG,private userService:UserService) { }

  ngOnInit(): void {
    this.loginStatus = this.userService.getLoginStatus();
    this.primeng.ripple.set(true);
    
  }

}
