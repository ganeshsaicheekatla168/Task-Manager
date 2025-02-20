import { CanActivateFn,Router,ActivatedRouteSnapshot ,RouterStateSnapshot } from '@angular/router';
import { inject} from '@angular/core';
import { UserService } from '../services/users/user.service';
export const authGuardGuard: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) => {
  const router:Router = inject(Router);
  const protectedRoutes:string[]=['/home/createTask','/home/dashboard','/home/viewTasks']
  const userService:UserService = inject(UserService);
  return protectedRoutes.includes(state.url) && !userService.getLoginStatus() ? router.navigate(['/login']):true;
};
