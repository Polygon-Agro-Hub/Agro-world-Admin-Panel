import { Component, Input } from '@angular/core';
import { DashboardHeader, Trends } from '../../../../models/call-center.model';
import { isoDateTime, isoTime } from '../../../../utils/call-center.utils';

@Component({
  selector: 'app-row-one',
  standalone: true,
  imports: [],
  templateUrl: './row-one.component.html',
  styleUrl: './row-one.component.css'
})
export class RowOneComponent {
  @Input({ required: true }) header!: DashboardHeader;
  @Input({ required: true }) trends!: Trends;

  get updatedTime(): string { return isoTime(this.header.lastUpdated); }
  get clock(): string { return isoDateTime(this.header.currentDateTime); }
  get isActive(): boolean { return this.header.telemetryStatus === 'active'; }
}