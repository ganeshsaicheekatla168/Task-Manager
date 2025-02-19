import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { UserService } from '../../services/users/user.service';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AppService } from '../../services/apps/app.service';

@Component({
  selector: 'app-header',
  imports: [MenuModule,AvatarModule,DrawerModule,ButtonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  
  avatarLabel ='U'
  items:MenuItem[]  = [
    {
      label: 'User Details',
      items: [
        {
          label: 'Export',
          icon: 'pi pi-envelope'
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          
        }
      ]
    }
  ];
  sideBarvisible:boolean=false;

  constructor(private userService: UserService){}

  ngOnInit(): void {
    const userInfo = this.userService.getUserInfo();
    this.avatarLabel =userInfo.first_name.charAt(0).toUpperCase();
    this.items = [
      {
        label: 'User Details',
        items: [
          {
            label: userInfo.email+"",
            icon: 'pi pi-envelope',
          },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
          }
        ]
      }
    ];
  }
 

  logout(){
    this.userService.clearUserData();
  }

 


  


}
