import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-center-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-center-action.component.html',
  styleUrl: './call-center-action.component.css',
})
export class CallCenterActionComponent {
  isCallLogsMenuOpen = false;

  constructor(private router: Router) {}

  // Close the sub menu when clicking anywhere outside
  @HostListener('document:click')
  closeMenus(): void {
    this.isCallLogsMenuOpen = false;
  }

  toggleCallLogsMenu(event: Event): void {
    event.stopPropagation();
    this.isCallLogsMenuOpen = !this.isCallLogsMenuOpen;
  }

  ivrCallSummary(event: Event): void {
    event.stopPropagation();
    this.isCallLogsMenuOpen = false;
    this.router
      .navigate(['/call-centers/action/ivr-call-summary'])
      .then(() => {});
  }

  ivrLiveCallLog(event: Event): void {
    event.stopPropagation();
    this.isCallLogsMenuOpen = false;
    this.router
      .navigate(['/call-centers/action/call-logs/ivr-live-call-log'])
      .then(() => {});
  }

  govicare(): void {
    this.router
      .navigate(['/call-centers/action/govi-care-call'])
      .then(() => {});
  }
}
