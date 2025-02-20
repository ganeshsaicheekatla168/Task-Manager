import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { ViewTasksComponent } from './components/view-tasks/view-tasks.component';
import { authGuardGuard } from './guards/auth-guard.guard';

export const routes: Routes = [


    
{
    path : "login",
    pathMatch : "full",
    loadComponent : () => {
        return import("../app/components/login/login.component")
        .then(m => m.LoginComponent)
    }
    
}
,

   
{
        path: 'home',
        component: HomeComponent, 
        canActivate:[authGuardGuard],
        children: [
          {
            path: 'dashboard',
            component: DashboardComponent
          },
          {
            path: 'createTask',
            component: CreateTaskComponent
          },
          {
            path : "viewTasks",
            component:ViewTasksComponent
          }
        
        ]
}
,{
    path : "signup",
    pathMatch : "full",
    loadComponent : () => {
            return import("../app/components/signup/signup.component")
            .then(m => m.SignupComponent)
    }
},



];
