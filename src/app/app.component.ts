import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, RouterModule } from '@angular/router';


import { PlantcareComponent } from './application/plantcare/plantcare.component';
import { SidenavComponent } from './application/main-components/sidenav/sidenav.component';
//import { AppNavbar } from './components/navbar/navbar.component';
import { HeaderComponent } from './application/main-components/header/header.component';
import { DashboardComponent } from './application/main-components/dashboard/dashboard.component';
import { FieldofficersComponent } from './application/fieldofficers/fieldofficers.component';
import { MarketplaceComponent } from './application/marketplace/marketplace.component';
import { ReportComponent } from './application/report-section/report/report.component';
import { SteckholdersComponent } from './application/steckholders-section/steckholders/steckholders.component';

import { NavbarComponent } from './components/navbar/navbar.component';

interface SideNavToggle {
  screenWidth : number;
  collapsed : boolean;
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SidenavComponent, PlantcareComponent, HeaderComponent, DashboardComponent, FieldofficersComponent, MarketplaceComponent, ReportComponent, SteckholdersComponent, NavbarComponent],
  template: `<router-outlet></router-outlet>`,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'plantr_care-admin';

  isSideNavCollapsed = false;
  screenWidth = 0;

  onToggleSideNav(data: SideNavToggle) :void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
