import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';

@Component({
  selector: 'app-view-govi-link-jobs-farmer-audit-response',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './view-govi-link-jobs-farmer-audit-response.component.html',
  styleUrl: './view-govi-link-jobs-farmer-audit-response.component.css',
})
export class ViewGoviLinkJobsFarmerAuditResponseComponent implements OnInit {
  constructor(private service: GoviLinkService) {}

  isLoading = false;
  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  scale = 1;

  jobData: JobData = {
    jobId: '',
    farmId: '',
    completedQuestions: '',
    certificate: '',
  };

  questions: Question[] = [];
  problems: Problem[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    const jobId = 'FA20251203003';
    const farmId = '197';

    this.service.getFieldAudit(jobId, farmId).subscribe({
      next: (res) => {
        const api = res.data;

        this.jobData.jobId = api.jobId;
        this.jobData.farmId = api.farmId;
        this.jobData.certificate = api.srtName;

        this.questions = api.data.map((q: ApiItem, index: number) => {
          const isPhoto = q.type.toLowerCase().includes('photo');

          let completed = false;

          if (isPhoto) {
            completed = !!q.uploadImage;
          } else {
            completed = q.officerTickResult === 1;
          }

          return {
            id: String(index + 1).padStart(2, '0'),
            type: q.type,
            question: q.qEnglish,
            status: completed ? 'Completed' : 'Incomplete',
            hasPhoto: isPhoto && !!q.uploadImage,
            photoUrl: q.uploadImage || '',
          };
        });

        const completedCount = this.questions.filter(
          (q) => q.status === 'Completed'
        ).length;
        this.jobData.completedQuestions = `${completedCount}/${this.questions.length} Questions`;

        const map = new Map<string, Problem>();

        api.data.forEach((item: ApiItem) => {
          if (item.problem && item.solution) {
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

  openModal(imageUrl: string, title: string) {
    this.modalImage = imageUrl;
    this.modalTitle = title;
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
  type: string;
  question: string;
  status: 'Completed' | 'Incomplete';
  hasPhoto: boolean;
  photoUrl?: string;
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
