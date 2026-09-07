import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-govi-link-jobs-farmer-audit-response',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './view-govi-link-jobs-farmer-audit-response.component.html',
  styleUrl: './view-govi-link-jobs-farmer-audit-response.component.css',
})

export class ViewGoviLinkJobsFarmerAuditResponseComponent implements OnInit {
  constructor(
    private service: GoviLinkService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  isLoading = false;
  isModalOpen = false;
  modalImages: Photo[] = [];
  modalTitle = '';
  currentIndex = 0;
  scale = 1;

  jobData: JobData = {
    jobId: '',
    farmId: '',
    completedQuestions: '',
    certificate: '',
  };

  jobId!: string;

  questions: Question[] = [];
  problems: Problem[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.jobId = queryParams['jobId'] || '';

      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;

    this.service.getFieldAudit(this.jobId).subscribe({
      next: (res) => {
        const api = res.data;

        this.jobData.jobId = api.jobId;
        this.jobData.farmId = api.farmId;

        const payType = (api.payType || '').toLowerCase();
        const cropName = api.cropNameEnglish?.trim();
        if (payType === 'farm' || !cropName) {
          this.jobData.certificate = `${api.srtName} for farm`;
        } else if (payType === 'crop' && cropName) {
          this.jobData.certificate = `${api.srtName} for ${cropName}`;
        } else {
          this.jobData.certificate = api.srtName;
        }

        this.questions = api.data.map((q: ApiItem, index: number) => {
          const isPhoto = q.type.toLowerCase().includes('photo');

          let completed = false;

          if (isPhoto) {
            completed = !!(q.uploadImage || q.officerUploadImage);
          } else {
            completed = q.officerTickResult === 1;
          }

          return {
            id: String(index + 1).padStart(2, '0'),
            type: q.type,
            question: q.qEnglish,
            status: completed ? 'Completed' : 'Incomplete',
            hasPhoto: isPhoto && !!(q.uploadImage || q.officerUploadImage),
            photoUrls: [
              q.uploadImage ? { label: 'Farmer Photo', url: q.uploadImage } : null,
              q.officerUploadImage ? { label: 'Officer Photo', url: q.officerUploadImage } : null,
            ].filter((photo): photo is Photo => photo !== null),
          };
        });

        const completedCount = this.questions.filter(
          (q) => q.status === 'Completed',
        ).length;
        this.jobData.completedQuestions = `${completedCount}/${this.questions.length} Questions`;

        const map = new Map<string, Problem>();

        api.data.forEach((item: ApiItem) => {
          if (item.suggestions && Array.isArray(item.suggestions)) {
            item.suggestions.forEach((suggestion: any) => {
              if (suggestion.problem && suggestion.solution) {
                const key = suggestion.problem + suggestion.solution;
                if (!map.has(key)) {
                  map.set(key, {
                    id: String(map.size + 1).padStart(2, '0'),
                    problem: suggestion.problem,
                    solution: suggestion.solution,
                  });
                }
              }
            });
          } else if (item.problem && item.solution) {
            const key = item.problem + item.solution;
            if (!map.has(key)) {
              map.set(key, {
                id: String(map.size + 1).padStart(2, '0'),
                problem: item.problem,
                solution: item.solution,
              });
            }
          }
        });

        this.problems = Array.from(map.values());

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onBack() {
    history.back();
  }

  openModal(images: Photo[], title: string) {
    this.modalImages = images;
    this.modalTitle = title;
    this.currentIndex = 0;
    this.isModalOpen = true;
    this.scale = 1;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  nextImage() {
    if (this.isModalOpen && this.modalImages.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.modalImages.length;
      this.scale = 1;
    }
  }

  prevImage() {
    if (this.isModalOpen && this.modalImages.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.modalImages.length) % this.modalImages.length;
      this.scale = 1;
    }
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
  officerUploadImage: string | null;
  officerTickResult: number;
  problem: string | null;
  solution: string | null;
  suggestions?: Array<{
    problem: string;
    solution: string;
  }>;
}

interface Question {
  id: string;
  type: string;
  question: string;
  status: 'Completed' | 'Incomplete';
  hasPhoto: boolean;
  photoUrls: Photo[];
}

interface Photo {
  label: string;
  url: string;
}

interface Problem {
  id: string;
  problem: string;
  solution: string;
}

interface JobData {
  jobId: string;
  farmId: string;
  completedQuestions: string;
  certificate: string;
}
