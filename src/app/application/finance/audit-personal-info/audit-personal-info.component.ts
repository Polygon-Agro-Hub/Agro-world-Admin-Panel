import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-personal-info',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './audit-personal-info.component.html',
  styleUrl: './audit-personal-info.component.css',
})
export class AuditPersonalInfoComponent {
  isLoading: boolean = false;
  activeButton: string = 'personal info';

  constructor() {}

  back(): void {
    window.history.back();
  }
}
