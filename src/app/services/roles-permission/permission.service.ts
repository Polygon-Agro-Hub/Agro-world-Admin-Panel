import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() { }

  getPermissions(): string[] {
    const permissions = localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }
}
