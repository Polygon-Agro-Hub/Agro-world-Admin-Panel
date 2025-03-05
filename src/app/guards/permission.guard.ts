import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PermissionService } from '../services/roles-permission/permission.service';
import { TokenService } from '../services/token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService, 
    private router: Router, 
    public tokenService: TokenService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Get the permission(s) required for the route from route data
    const requiredPermissions = route.data['permission'];

    // Check if user is an admin (role '1')
    const isAdmin = this.tokenService.getUserDetails().role === '1';

    // Check permissions
    const hasPermission = isAdmin || this.checkPermissions(requiredPermissions);

    // If no permission, redirect to a status page
    if (!hasPermission) {
      this.router.navigate(['/status-451']); // Unauthorized route
    }

    return hasPermission;
  }

  private checkPermissions(permissions: string | string[]): boolean {
    // Handle both single permission and array of permissions
    if (!permissions) return false;

    if (typeof permissions === 'string') {
      // Single permission case
      return this.permissionService.hasPermission(permissions);
    }

    // Multiple permissions case
    return permissions.some(permission => 
      this.permissionService.hasPermission(permission)
    );
  }
}