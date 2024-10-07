import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme: boolean = false;

  constructor() { }

  toggleTheme1() {
    this.darkTheme = !this.darkTheme;
    if (this.darkTheme) {
      document.body.classList.add('dark');
      console.log('dark');
    } else {
      document.body.classList.remove('dark');
      console.log('light');
    }
  }

  toggleTheme() {
    this.darkTheme = !this.darkTheme;
    console.log('Button clicked, darkTheme:', this.darkTheme);  // Log the current theme state
  
    if (this.darkTheme) {
      document.body.classList.add('dark');
      console.log('dark mode activated');
    } else {
      document.body.classList.remove('dark');
      console.log('light mode activated');
    }
  }

  getActiveTheme(): string {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
  }
}
