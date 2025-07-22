import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme: boolean = false;
  private themeKey = 'selectedTheme';
  private themeSubject = new BehaviorSubject<string>(this.getActiveTheme());

  constructor() { 
    this.applySavedTheme();
  }

  // Observable for components to subscribe to theme changes
  get themeChanged$(): Observable<string> {
    return this.themeSubject.asObservable();
  }

  toggleTheme() {
    const currentTheme = this.getActiveTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  getActiveTheme(): string {
    return localStorage.getItem(this.themeKey) || 'light';
  }

  setTheme(theme: string) {
    localStorage.setItem(this.themeKey, theme);
    this.applyTheme(theme);
    this.themeSubject.next(theme); // Notify subscribers
  }

  private applyTheme(theme: string) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }

  // Apply saved theme on initialization
  private applySavedTheme() {
    const savedTheme = this.getActiveTheme();
    this.applyTheme(savedTheme);
    this.themeSubject.next(savedTheme); // Initialize the subject
  }

  isDarkTheme(): boolean {
    return this.getActiveTheme() === 'dark';
  }
}