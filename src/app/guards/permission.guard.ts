import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PermissionService } from '../services/roles-permission/permission.service';
import { TokenService } from '../services/token/services/token.service';


@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private router: Router, public tokenService: TokenService,) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredPermission = route.data['permission']; // get the permission required for the route
    const hasPermission = this.permissionService.hasPermission(requiredPermission) || this.tokenService.getUserDetails().role ==='1';

    if (!hasPermission) {
      this.router.navigate(['/status-451']); // or a route you prefer to show no permission message
    }

    return hasPermission;
  }
}
