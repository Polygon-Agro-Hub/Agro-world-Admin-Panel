import { Component, Output, EventEmitter, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { navbarData } from './nav-data';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<boolean> = new EventEmitter();
  isExpanded = false;
  screenWidth = 0;
  isLeftButtonVisible: boolean = true;
  navData = navbarData;
  ispopupMarketPrice = false

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object  , private router: Router) {}
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth <= 768) {
        this.isExpanded = false;
        this.onToggleSideNav.emit(this.isExpanded);
      }
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      this.isExpanded = this.screenWidth > 768;
      this.onToggleSideNav.emit(this.isExpanded);
    }
  }
  
  redirectToPage(): void {
    this.router.navigateByUrl('/steckholders'); // Use your desired route here
  }

  toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
    this.isLeftButtonVisible = !this.isLeftButtonVisible;
    this.onToggleSideNav.emit(this.isExpanded);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Remove the login token from localStorage
      localStorage.removeItem('Login Token : ');
  
      // Show a logout confirmation
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
      }).then(() => {
        // Redirect to the login page after confirmation
        this.router.navigateByUrl('/login');
      });
    }
  }

  popupMarket(){
    this.ispopupMarketPrice = !this.ispopupMarketPrice
  }


  
}