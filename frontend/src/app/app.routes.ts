import { Routes } from '@angular/router';

export const routes: Routes = [
    
{
    path : "login",
    pathMatch : "full",
    loadComponent : () => {
        return import("../app/components/login/login.component")
        .then(m => m.LoginComponent)
    }
    
},
{
    path : "dashboard",
    pathMatch : "full",
    loadComponent : () => {
            return import("../app/components/dashboard/dashboard.component")
            .then(m => m.DashboardComponent)
    }
},{
    path : "signup",
    pathMatch : "full",
    loadComponent : () => {
            return import("../app/components/signup/signup.component")
            .then(m => m.SignupComponent)
    }
}
];
