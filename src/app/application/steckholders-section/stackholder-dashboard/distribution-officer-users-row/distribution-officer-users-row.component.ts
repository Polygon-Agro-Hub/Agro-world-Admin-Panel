import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-distribution-officer-users-row',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './distribution-officer-users-row.component.html',
  styleUrl: './distribution-officer-users-row.component.css',
})
export class DistributionOfficerUsersRowComponent implements OnChanges {
  @Input() fifthRow: any = {};
  @Output() distributionOfficerDataEmitted = new EventEmitter<any>();

  centerHeadOfficers: number = 0;
  centerManagers: number = 0;
  distributionOfficers: number = 0;
  newOfficers: number = 0;
  allOfficers: number = 0;
  activeOfficers: number = 0;
  totalOfficers: number = 0;

  ngOnChanges(): void {
    this.fetchDistributionOfficerData(this.fifthRow);
  }

  fetchDistributionOfficerData(data: any) {
    this.centerHeadOfficers = data.distributionOfficersByPosition?.DCH?.officerCount ?? 0;
    this.centerManagers = data.distributionOfficersByPosition?.DCM?.officerCount ?? 0;
    this.distributionOfficers = data.distributionOfficersByPosition?.DOO?.officerCount ?? 0;
    this.newOfficers = data?.newDistributionOfficers ?? 0;
    this.activeOfficers = data?.activeDistributionOfficers ?? 0;
    this.totalOfficers = data?.totalDistributionOfficers ?? 0;
    
    // Calculate all officers (sum of positions)
    this.allOfficers = this.totCount(
      this.centerHeadOfficers,
      this.centerManagers,
      this.distributionOfficers
    );

    this.distributionOfficerDataEmitted.emit({
      centerHeadOfficers: this.centerHeadOfficers,
      centerManagers: this.centerManagers,
      distributionOfficers: this.distributionOfficers,
      newOfficers: this.newOfficers,
      allOfficers: this.allOfficers,
      activeOfficers: this.activeOfficers,
      totalOfficers: this.totalOfficers,
    });
  }

  totCount(x1: number, x2: number, x3: number): number {
    return x1 + x2 + x3;
  }
}