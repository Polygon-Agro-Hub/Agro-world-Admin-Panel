import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme: boolean = false;
  private themeKey = 'selectedTheme';

  constructor() { this.applySavedTheme();}

  

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
  }

  private applyTheme(theme: string) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }

  // Apply saved theme on initialization
  private applySavedTheme() {
    const savedTheme = this.getActiveTheme();
    this.applyTheme(savedTheme);
  }
}
