import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  
  userName = localStorage.getItem('userName:');
    
  constructor(private elementRef: ElementRef,private router: Router, private themeService: ThemeService) {}

  

  
  navigateToCreateAdmin() {
    this.router.navigate(['/admin/admin-users/create-admin-user']);
  }

  editMeAdminUser() {
    this.router.navigate(['/admin/admin-users/edit-admin-me-user']);
  }

  toggleTheme() {
    this.themeService.toggleTheme(); // Call ThemeService to toggle dark/light mode
  }

  isDarkTheme(): boolean {
    return this.themeService.getActiveTheme() === 'dark';
  }


}
