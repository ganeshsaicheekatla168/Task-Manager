import { CanActivateFn,Router,ActivatedRouteSnapshot ,RouterStateSnapshot } from '@angular/router';
import { inject} from '@angular/core';
import { UserService } from '../services/users/user.service';
export const authGuardGuard: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) => {
  const router:Router = inject(Router);
  const protectedRoutes:string[]=['/home/createTask','/home/dashboard','/home/viewTasks'];
  const protectedBasePages:string[]=['/login','/singup','/forgot-password','/reset-password'];
  const userService:UserService = inject(UserService);

  // Check if the token is valid (i.e., user is logged in)
  const tokenValid = !userService.isTokenExpired();  // Assuming this method checks the expiration

  // If the user is already logged in, redirect to dashboard if they try to access login page
  if (protectedBasePages.includes(state.url) && tokenValid) {
    return router.navigate(['/home/dashboard']);
  }

  // If the user is not logged in, redirect to login page if trying to access protected routes
  if (protectedRoutes.includes(state.url) && !tokenValid) {
    localStorage.removeItem('userInfo');  // Remove from localStorage
    localStorage.removeItem('loginStatus');
    localStorage.removeItem('token');
    return router.navigate(['/login']);;
  }

  // Otherwise, allow navigation to the route
  return true;
};
