import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-center-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-center-action.component.html',
  styleUrl: './call-center-action.component.css',
})
export class CallCenterActionComponent {
  constructor(private router: Router) {}

  govicare(): void {
    this.router
      .navigate(['/call-centers/action/govi-care-call'])
      .then(() => {});
  }

  allCallLogs(): void {
    this.router
      .navigate(['/call-centers/action/call-logs'])
      .then(() => {});
  }
}
