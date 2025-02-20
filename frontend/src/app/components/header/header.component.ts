import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { UserService } from '../../services/users/user.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [MenuModule,AvatarModule,DrawerModule,ButtonModule,RouterLink,ToastModule,ConfirmDialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers:[MessageService,ConfirmationService,Router]
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
         
        }
      ]
    }
  ];
  sideBarvisible:boolean=false;

  constructor(private userService: UserService ,private messageService:MessageService,private confirmationService:ConfirmationService,private router:Router){}

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
            command: () =>{ this.showLogoutConfirmation();}
          }
        ]
      }
    ];
  }
 

  

  showLogoutConfirmation() {
    const firstName = this.userService.getUserInfo().first_name;
    this.confirmationService.confirm({
      message: `Are you sure you want to logout ${firstName}?`,
      header: 'Logout Confirmation  ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.confirmLogout();
      },
      reject: () => {
        this.cancelLogout();
      },
    });
    
  }

  confirmLogout() {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Redirecting to LoginPage...', 
      life: 3000 
    });
    setTimeout(()=>{
      this.userService.clearUserData();
    },3000);
  }

   // Method to trigger a failure (error) toast message
  cancelLogout() {
    const firstName = this.userService.getUserInfo().first_name; // Get the user's first name
    this.messageService.add({ 
      severity: 'info',  // Changed to 'error' for failure messages
      summary: 'Logout Cancelled', 
      detail: `Thanks for staying, ${firstName}!`, 
      life: 4000,  // Message will disappear after 4 seconds
     
    });
  }

 


  


}
