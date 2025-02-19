import { Component, OnInit } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/users/user.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule,CommonModule,HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
 
  loginStatus:boolean =false;
  constructor(private primeng: PrimeNG,private userService:UserService) { }

  ngOnInit(): void {
    this.loginStatus = this.userService.getLoginStatus();
    this.primeng.ripple.set(true);
    
  }

}
