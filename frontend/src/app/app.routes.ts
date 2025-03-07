import { Routes } from '@angular/router';
import { DashboardComponent } from '../app/components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { ViewTasksComponent } from './components/view-tasks/view-tasks.component';
import { authGuardGuard } from './guards/auth-guard.guard';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: "login",
    component: LoginComponent,
    canActivate: [authGuardGuard]

  }
  ,

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuardGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuardGuard]
      },
      {
        path: 'createTask',
        component: CreateTaskComponent,
        canActivate: [authGuardGuard]
      },
      {
        path: "viewTasks",
        component: ViewTasksComponent,
        canActivate: [authGuardGuard]
      }

    ]
  }
  , {
    path: "signup",
    pathMatch: "full",
    canActivate: [authGuardGuard],
    loadComponent: () => {
      return import("../app/components/signup/signup.component")
        .then(m => m.SignupComponent)
    }
  },


  {
    path: "forgot-password",
    canActivate: [authGuardGuard],
    loadComponent: () => {
      return import("../app/components/forgot-password/forgot-password.component").then(
        m => m.ForgotPasswordComponent
      )
    }
  },


  {
    path: "reset-password",
    canActivate: [authGuardGuard],
    component: ResetPasswordComponent
  },
  {
    path: "**",
    component: PageNotFoundComponent
  }


];
