import { Component } from '@angular/core';
import { SidenavComponent } from "../../application/main-components/sidenav/sidenav.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, SidenavComponent, NavbarComponent ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isSidenavExpanded = false;

  onSidenavToggle(expanded: boolean) {
    this.isSidenavExpanded = expanded;
  }
}
