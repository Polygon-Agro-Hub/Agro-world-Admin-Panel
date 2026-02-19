import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { DestributionService } from '../../../../../../services/destribution-service/destribution-service.service';

// Define the timeline step types specific to pickup orders
type PickupTimelineStepType = 'ready' | 'picked_up' | 'not_available';

interface PickupTimelineStep {
  type: PickupTimelineStepType;
  payload: any;
}

interface PickupOrderRecord {
  deliveredTime?: string;
  outTime?: string;
  readyTime?: string;
  markedReadyTime?: string;
  pickedUpTime?: string;
  collectedTime?: string;
  outOfficer?: string;
  officerName?: string;
}

@Component({
  selector: 'app-pikup-oder-record-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pikup-oder-record-details.component.html',
  styleUrls: ['./pikup-oder-record-details.component.css'],
})
export class PikupOderRecordDetailsComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() orderId: number | undefined;  // This is processOrderId for API call
  @Input() displayOrderId: string = '';  // This is invoice/order number for display
  @Output() close = new EventEmitter<void>();

  pickupDetails: PickupOrderRecord | null = null;
  loading: boolean = false;
  error: string = '';
  steps: PickupTimelineStep[] = [];

  // Individual properties for backward compatibility with template
  deliveredTime: string | null = null;
  outTime: string | null = null;
  outOfficer: string = '';

  constructor(private pickupOrderService: DestributionService) {}

  ngOnInit(): void {
    console.log('Component initialized with orderId:', this.orderId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When component becomes visible and has an orderId, load data
    if (changes['visible'] && this.visible && this.orderId) {
      console.log('Loading details for processOrderId:', this.orderId);
      console.log('Display order ID (invoice):', this.displayOrderId);
      this.loadPickupOrderDetails(this.orderId);
    }

    // Reset when hidden
    if (changes['visible'] && !this.visible) {
      this.resetData();
    }
  }

  loadPickupOrderDetails(id: number): void {
    this.loading = true;
    this.error = '';
    this.steps = [];

    this.pickupOrderService.getPickupOrderRecords(id).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response && response.status) {
          this.pickupDetails = response.data;
          
          // Build timeline steps
          this.steps = this.buildSteps(response.data);
          
          // Set individual properties for template compatibility
          this.setIndividualProperties(response.data);
          
          console.log('Pickup details loaded successfully:', response.data);
          console.log('Timeline steps:', this.steps);
        } else {
          this.error = response?.message || 'Failed to load pickup details';
          console.warn('API response structure unexpected:', response);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 
                    err.message || 
                    'Failed to load pickup order records. Please try again.';
        console.error('API Error for processOrderId:', id, err);
        
        // For testing, you can still use mock data
        // this.useMockData();
      },
    });
  }

  private buildSteps(data: PickupOrderRecord): PickupTimelineStep[] {
    const steps: PickupTimelineStep[] = [];

    // Check if we have "ready to pickup" information
    const readyTime = data.outTime || data.readyTime || data.markedReadyTime;
    if (readyTime) {
      steps.push({
        type: 'ready',
        payload: {
          time: readyTime,
          officer: data.outOfficer || data.officerName || 'Unknown Officer'
        }
      });
    }

    // Check if we have "picked up" information
    const pickupTime = data.deliveredTime || data.pickedUpTime || data.collectedTime;
    if (pickupTime) {
      steps.push({
        type: 'picked_up',
        payload: {
          time: pickupTime
        }
      });
    }

    // If no steps, add a "not available" step
    if (steps.length === 0) {
      steps.push({
        type: 'not_available',
        payload: { message: 'No status information available' }
      });
    }

    return steps;
  }

  private setIndividualProperties(data: PickupOrderRecord): void {
    // Set for backward compatibility with template
    this.deliveredTime = data.deliveredTime || data.pickedUpTime || data.collectedTime || null;
    this.outTime = data.outTime || data.readyTime || data.markedReadyTime || null;
    this.outOfficer = data.outOfficer || data.officerName || '';
  }

  // Optional: Enhanced mock data
  private useMockData(): void {
    setTimeout(() => {
      this.loading = false;
      const mockData: PickupOrderRecord = {
        deliveredTime: new Date().toISOString(),
        outTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        outOfficer: 'John Doe',
        officerName: 'John Doe',
      };
      
      this.pickupDetails = mockData;
      this.steps = this.buildSteps(mockData);
      this.setIndividualProperties(mockData);
      
      console.log('Using mock data for testing');
    }, 1000);
  }

  resetData(): void {
    this.pickupDetails = null;
    this.loading = false;
    this.error = '';
    this.steps = [];
    this.deliveredTime = null;
    this.outTime = null;
    this.outOfficer = '';
  }

  closePopup(): void {
    this.close.emit();
  }

  // Enhanced helper methods
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  }

  formatTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'Invalid Time';
    }
  }

  formatDateTime(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      console.error('Error formatting datetime:', e);
      return 'Invalid Date/Time';
    }
  }

  // Helper to get step icon or class
  getStepIconClass(stepType: PickupTimelineStepType): string {
    switch (stepType) {
      case 'ready':
        return 'bg-blue-500 text-white';
      case 'picked_up':
        return 'bg-green-500 text-white';
      case 'not_available':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getStepLabel(stepType: PickupTimelineStepType): string {
    switch (stepType) {
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'Picked Up';
      case 'not_available':
        return 'No Status Available';
      default:
        return 'Unknown Status';
    }
  }
}