import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-govi-link-jobs-service-request-response',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './govi-link-jobs-service-request-response.component.html',
  styleUrl: './govi-link-jobs-service-request-response.component.css'
})

export class GoviLinkJobsServiceRequestResponseComponent implements OnInit {

  jobId!: string;
  purpose!: string;
  isLoading: boolean = false;

  totalItems!: number;
  hasData: boolean = false;
  serviceRequestResponse: Partial<Response> = {}

  // Modal properties
  isModalOpen = false;
  modalImage = '';
  modalTitle = '';

  // Zoom and pan properties
  scale = 1;
  positionX = 0;
  positionY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;

  questions: Question[] = [];
  problems: Problem[] = [];

  constructor(
    private router: Router,
    private goviLinkService: GoviLinkService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.jobId = queryParams['jobId'] || '';
      this.purpose = queryParams['purpose'] || '';
      this.fetchResponse();
    });
  }

  fetchResponse() {
    this.isLoading = true;
    this.goviLinkService.getServiceRequestResponse(this.jobId).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.serviceRequestResponse = response.data.auditDetails
          this.questions = (response.data.advices || []).map((question: Question) => {
            const isPhoto = (question.type || '').toLowerCase().includes('photo');
            const photoUrl = question.image || question.officerUploadImage || question.uploadImage || '';

            return {
              ...question,
              image: photoUrl,
              status: isPhoto && photoUrl ? 'Completed' : question.status,
            };
          });
          this.problems = response.data.suggestions
          this.totalItems = response.data.length;
          this.hasData = this.totalItems > 0;
        } else {
          this.hasData = false;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching job history:', error);
        this.hasData = false;
      }
    );
  }

  onBack() {
    history.back();
  }

  // Modal methods with zoom and pan functionality
  openModal(imageUrl: string) {
    this.modalImage = imageUrl;
    this.isModalOpen = true;
    this.resetZoomAndPan();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetZoomAndPan();
  }

  resetZoomAndPan() {
    this.scale = 1;
    this.positionX = 0;
    this.positionY = 0;
    this.isDragging = false;
  }

  zoomIn() {
    if (this.scale < 3) {
      this.scale += 0.2;
      // Reset position if zoomed out to 1 or below
      if (this.scale <= 1) {
        this.resetPosition();
      }
    }
  }

  zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.2;
      // Reset position if zoomed out to 1 or below
      if (this.scale <= 1) {
        this.resetPosition();
      }
    }
  }

  resetPosition() {
    this.positionX = 0;
    this.positionY = 0;
  }

  // Mouse event handlers for panning
  startDrag(event: MouseEvent) {
    // Only allow dragging when zoomed in
    if (this.scale > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.positionX;
      this.startY = event.clientY - this.positionY;

      // Prevent default drag behavior
      event.preventDefault();

      // Change cursor style
      const container = event.currentTarget as HTMLElement;
      if (container) {
        container.style.cursor = 'grabbing';
      }
    }
  }

  onDrag(event: MouseEvent) {
    if (this.isDragging && this.scale > 1) {
      event.preventDefault();

      // Calculate new position
      this.positionX = event.clientX - this.startX;
      this.positionY = event.clientY - this.startY;

      // Constrain panning within reasonable bounds
      this.constrainPosition();
    }
  }

  stopDrag() {
    if (this.isDragging) {
      this.isDragging = false;

      // Reset cursor style
      const container = document.querySelector('.image-container') as HTMLElement;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  }

  // Touch event handlers for mobile devices
  startTouch(event: TouchEvent) {
    if (this.scale > 1 && event.touches.length === 1) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX - this.positionX;
      this.startY = event.touches[0].clientY - this.positionY;

      // Prevent default touch behavior (like page scrolling)
      event.preventDefault();
    }
  }

  onTouchMove(event: TouchEvent) {
    if (this.isDragging && this.scale > 1 && event.touches.length === 1) {
      event.preventDefault();

      // Calculate new position
      this.positionX = event.touches[0].clientX - this.startX;
      this.positionY = event.touches[0].clientY - this.startY;

      // Constrain panning within reasonable bounds
      this.constrainPosition();
    }
  }

  // Constrain panning to prevent image from moving too far off-screen
  constrainPosition() {
    // Calculate maximum pan distance based on scale
    // The 272 value is half of the max image width/height (545/2 ≈ 272)
    // This ensures the image doesn't move completely off-screen
    const maxPanX = (this.scale - 1) * 272;
    const maxPanY = (this.scale - 1) * 272;

    // Apply constraints
    this.positionX = Math.min(Math.max(this.positionX, -maxPanX), maxPanX);
    this.positionY = Math.min(Math.max(this.positionY, -maxPanY), maxPanY);
  }

  // Helper method to get cursor style
  getCursorStyle(): string {
    if (this.scale > 1) {
      return this.isDragging ? 'grabbing' : 'grab';
    }
    return 'default';
  }

  // Helper method to get zoom percentage
  getZoomPercentage(): number {
    return Math.round(this.scale * 100);
  }

}

interface ApiItem {
  qEnglish: string;
  type: string;
  uploadImage: string | null;
  officerUploadImage: string | null;
  officerTickResult: number;
  problem: string | null;
  solution: string | null;
}

interface Question {
  id: string;
  farmerFeedback: string;
  advice: string;
  image: string;
  uploadImage?: string | null;
  officerUploadImage?: string | null;
  type: string;
  question: string;
  status: 'Completed' | 'Incomplete';
  hasPhoto: boolean;
  photoUrl?: string;
}

interface Problem {
  id: number;
  jobId: string;
  problem: string;
  solution: string;
}

class Response {
  jobId!: string;
  farmCode!: string;
  completedQuestions!: string;
  serviceName!: string;
  cropNames!: string[];
}