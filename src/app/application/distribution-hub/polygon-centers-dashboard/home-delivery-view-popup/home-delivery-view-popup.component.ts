import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
// import { DistributionServiceService } from '../../../services/Distribution-Service/distribution-service.service';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';

interface HoldDetail {
  holdId: number;
  holdTime: string;
  holdReason: string;
  restartedTime: string | null;
}

interface DriverDetails {
  orderId: number;
  empId: string;
  driverName: string;
  driverPhone: string;
  collectTime: string;
  startTime: string | null;
  holdDetails: HoldDetail[];
  returnReson: string | null;
  returnNote: string | null;
  returnTime: string | null;
  returnRecivedTime: string | null;
  completeTime: string | null;
  moneyHandoverTime: string | null;
}

interface CenterDetails {
  id: number;
  invNo: string;
  outDlvrDate: Date;
  status: string;
  centerName: string;
  regCode: string;
  centerId: number;
  empId: string;
  deliveredTime: Date;
}

interface TrackingDetails {
  centerDetails: CenterDetails;
  driverDetails: DriverDetails;
}

interface TimelineStep {
  type:
    | 'out'
    | 'pickedup'
    | 'collected'
    | 'started'
    | 'hold'
    | 'restart'
    | 'return'
    | 'delivered'
    | 'return recieved';
  payload: any;
}

@Component({
  selector: 'app-home-delivery-view-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-delivery-view-popup.component.html',
  styleUrl: './home-delivery-view-popup.component.css'
})
export class HomeDeliveryViewPopupComponent implements OnInit, OnChanges
{
  @Input() visible: boolean = false;
  @Input() deliveryId!: number; 
  @Output() closePopup = new EventEmitter<void>();

  trackingDetails: TrackingDetails | null = null;
  loading: boolean = false;
  error: string = '';
  steps: TimelineStep[] = [];

  constructor(private distributionService: DistributionHubService) {}

  ngOnInit(): void {
    console.log('deliveryId', this.deliveryId)
    if (this.visible) {
      this.loadTrackingDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.loadTrackingDetails();
    }
  }

  loadTrackingDetails(): void {
    this.loading = true;
    this.error = '';
    this.steps = [];

    this.distributionService
      .getHomeDeliveryTracking(this.deliveryId)
      .subscribe({
        next: (response) => {
          this.trackingDetails = response;
          this.steps = this.buildSteps();
          console.log('steps', this.steps)
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load tracking details';
          this.loading = false;
          console.error('Error loading tracking details:', err);
        },
      });
  }

  private buildSteps(): TimelineStep[] {
    const steps: TimelineStep[] = [];
    const c = this.trackingDetails?.centerDetails;
    const d = this.trackingDetails?.driverDetails;

    if (!c) return steps;

    if (!c.outDlvrDate) {
      return steps;
    }

    steps.push({
      type: 'out',
      payload: { outDlvrDate: c.outDlvrDate, regCode: c.regCode || '', centerName: c.centerName || '', empId: c.empId  }
    });

    if (c.deliveredTime && c.centerId !== null) {
      steps.push({
        type: 'pickedup',
        payload: { deliveredTime: c.deliveredTime }
      });

      console.log('steps', steps)
    }

    if (!d) return steps;

    if (d.collectTime) {
      steps.push({ type: 'collected', payload: { empId: d.empId, driverName: d.driverName, driverPhone: d.driverPhone, collectTime: d.collectTime } });
    } else {
      return steps; 
    }

    if (d.startTime) {
      steps.push({ type: 'started', payload: { startTime: d.startTime } });
    }

    const holds = Array.isArray(d.holdDetails) ? d.holdDetails : [];
    for (const hold of holds) {
      if (hold?.holdTime) {
        steps.push({ type: 'hold', payload: { holdTime: hold.holdTime, holdReason: hold.holdReason } });
      }
      if (hold?.restartedTime) {
        steps.push({ type: 'restart', payload: { restartedTime: hold.restartedTime } });
      }
    }

    if (d.returnTime) {
      steps.push({ type: 'return', payload: { returnTime: d.returnTime, returnReson: (d.returnReson || ''), returnNote: (d.returnNote || null) } });
    }

    if (d.completeTime) {
      steps.push({ type: 'delivered', payload: { completeTime: d.completeTime } });
    }

    if (d.returnRecivedTime) {
      steps.push({ type: 'return recieved', payload: { returnRecivedTime: d.returnRecivedTime } });
    }

    return steps;
  }

  close(): void {
    this.closePopup.emit();
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  
}