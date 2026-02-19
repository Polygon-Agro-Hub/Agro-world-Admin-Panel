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

  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  scale = 1;

  questions: Question[] = [];
  problems: Problem[] = [];


  constructor(
    private router: Router,
    private goviLinkService: GoviLinkService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('running');
    
    this.route.queryParams.subscribe(queryParams => {
      this.jobId = queryParams['jobId'] || '';
      this.purpose = queryParams['purpose'] || '';
  
      console.log('jobId', this.jobId);
  
      this.fetchResponse();
    });
  }

  fetchResponse() {
    this.isLoading = true;

    this.goviLinkService.getServiceRequestResponse(this.jobId).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          console.log('response', response)
          this.serviceRequestResponse = response.data.auditDetails
          this.questions = response.data.advices
          this.problems = response.data.suggestions
          console.log('serviceRequestResponse', this.serviceRequestResponse)
          console.log('questions', this.questions)
          console.log('problems', this.problems)
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

  openModal(imageUrl: string) {
    this.modalImage = imageUrl;
    this.isModalOpen = true;
    this.scale = 1;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  zoomIn() {
    if (this.scale < 3) this.scale += 0.2;
  }

  zoomOut() {
    if (this.scale > 0.5) this.scale -= 0.2;
  }

  

}

interface ApiItem {
  qEnglish: string;
  type: string;
  uploadImage: string | null;
  officerTickResult: number;
  problem: string | null;
  solution: string | null;
}

interface Question {
  id: string;
  farmerFeedback: string;
  advice: string;
  image: string;
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