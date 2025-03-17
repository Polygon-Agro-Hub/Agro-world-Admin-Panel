import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(
    public tokenService: TokenService
  ) { }

  getPermissions(): string[] {
    return this.tokenService.getUserDetails().permissions || [];
  }
  

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);

  }
}
