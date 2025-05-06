import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  token: string | null;
  userName: string | null;
  userId: string | null;
  role: string | null;
  permissions: string[];
  expiresAt: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthContextService {
  // Initialize with null (no user logged in)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Expose as Observable for components to subscribe
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Set user data in memory
  setCurrentUser(
    token: string,
    userName: string,
    userId: string,
    role: string,
    permissions: string[],
    expiresIn: number // in seconds
  ): void {
    const expiresAt = Date.now() + expiresIn * 1000; // Convert to milliseconds
    
    this.currentUserSubject.next({
      token,
      userName,
      userId,
      role,
      permissions,
      expiresAt
    });
  }

  // Clear user data (logout)
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  // Get current user synchronously
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.expiresAt) return true;
    return Date.now() > user.expiresAt;
  }
}