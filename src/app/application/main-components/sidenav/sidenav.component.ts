import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { navbarData } from './nav-data';
import { RouterModule, UrlTree } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface NavItem {
  RouterLink: string | null;
  icon: string;
  label: string;
  expanded?: boolean;
  children?: NavItem[]; // children is an optional property of type NavItem array
}

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
  ispopupMarketPrice = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

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

      // Set expanded state for nav items based on current route
      this.navData.forEach((item) => {
        // Check if any of the children matches the current route
        if (item.children) {
          item.expanded = item.children.some((child) =>
            this.router.url.includes(child.RouterLink)
          );
        }
      });

      this.onToggleSideNav.emit(this.isExpanded);
    }
  }

  isParentActive(item: any): boolean {
    // Check if the parent route is active
    if (this.router.isActive(item.RouterLink, false)) {
      return true;
    }

    // Check for active child routes
    if (item.children) {
      return item.children.some((child: { RouterLink: string | UrlTree }) =>
        this.router.isActive(child.RouterLink, false)
      );
    }

    return false;
  }

  getActiveClass(item: any): string {
    return this.isParentActive(item) ? 'active' : '';
  }

  getActiveChildClass(child: any): string {
    return this.router.isActive(child.RouterLink, false) ? 'active' : '';
  }

  redirectToPage(): void {
    this.router.navigateByUrl('/steckholders/dashboard'); // Use your desired route here
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
        icon: 'warning',
        title: 'Logged Out',
        text: 'Are you sure, you want to logged out.',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to the login page after confirmation
          this.router.navigate(['login']);
        }
      });
    }
  }

  settings(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Remove the login token from localStorage
      localStorage.removeItem('Login Token : ');

      // Show a logout confirmation
      Swal.fire({
        icon: 'warning',
        title: 'Logged Out',
        text: 'Are you sure, you want to logged out.',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to the login page after confirmation
          this.router.navigate(['login']);
        }
      });
    }
  }

  popupMarket() {
    this.ispopupMarketPrice = !this.ispopupMarketPrice;
  }

  // toggleChildren(item: any): void {
  //   if (item.children) {
  //     item.expanded = !item.expanded;
  //   }

  // }

  toggleChildren(item: any): void {
    this.navData.forEach((navItem) => {
      if (navItem !== item) {
        navItem.expanded = false; // Close all other expanded items
      }
    });

    // Toggle only the clicked item
    item.expanded = !item.expanded;
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings/view-roles']);
  }
}
