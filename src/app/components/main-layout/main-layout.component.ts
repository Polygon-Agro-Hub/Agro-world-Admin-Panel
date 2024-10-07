import { Component } from '@angular/core';
import { SidenavComponent } from "../../application/main-components/sidenav/sidenav.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, SidenavComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isSidenavExpanded = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Check if the body already has the dark mode class
    const isDarkMode = document.body.classList.contains('dark');
    console.log('Is dark mode active?', isDarkMode);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onSidenavToggle(expanded: boolean) {
    this.isSidenavExpanded = expanded;
  }
}
