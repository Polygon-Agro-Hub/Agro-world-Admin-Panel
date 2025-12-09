import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-driver-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-row.component.html',
  styleUrl: './driver-row.component.css',
})
export class DriverRowComponent implements OnChanges {
  @Input() sixthRow: any = {};
  @Output() driverDataEmitted = new EventEmitter<any>();

  drivers: number = 0;
  newDriver: number = 0;

  ngOnChanges(): void {
    this.fetchDriverData(this.sixthRow);
  }

  fetchDriverData(data: any) {
    this.drivers = data.distributionOfficersByPosition?.DRV?.officerCount ?? 0;
    this.newDriver = data?.newDistributionOfficers ?? 0;

    this.driverDataEmitted.emit({
      driver: this.drivers,
      newDriver: this.newDriver,
    });
  }
}
