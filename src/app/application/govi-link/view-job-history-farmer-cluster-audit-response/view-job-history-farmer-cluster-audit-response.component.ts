import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-job-history-farmer-cluster-audit-response',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './view-job-history-farmer-cluster-audit-response.component.html',
  styleUrl: './view-job-history-farmer-cluster-audit-response.component.css'
})
export class ViewJobHistoryFarmerClusterAuditResponseComponent implements OnInit {

  constructor(private goviLinkService: GoviLinkService, private router: Router, private route: ActivatedRoute) { }

  isLoading = false;
  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  scale = 1;
  jobId!: string;

  jobData = {
    jobId: '',
    certificate: '',
    completedFarms: '',
  };

  farmNav = {
    current: 1,
    total: 0,
    farmId: '',
    completedQuestions: ''
  };

  questions: Question[] = [];

  problems: Problem[] = [];

  farmsData: FarmData[] = [];

  ngOnInit(): void {
     this.route.queryParams.subscribe(queryParams => {
      this.jobId = queryParams['jobId'] || '';
      console.log('jobId', this.jobId);
  
      this.loadData();
    });
  }

  loadData() {
    this.isLoading = true;

    if (!this.jobId) {
      console.error('No jobId provided');
      this.isLoading = false;
      return;
    }

    this.goviLinkService.getFarmerClusterAudith(this.jobId).subscribe({
      next: (res) => {
        console.log('API Response:', res);

        if (!res.success) {
          console.error('API returned success: false');
          this.isLoading = false;
          return;
        }

        const header = res.header;
        const farms = res.farms;

        this.jobData.jobId = header.jobId;
        this.jobData.certificate = `${header.srtName} for farmer cluster`;

        this.farmsData = farms.map((farm: ApiFarm) => {
          const questions = farm.questions.map((q: ApiQuestion, index: number) => {
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

          const completedCount = questions.filter(q => q.status === 'Completed').length;

          const problemMap = new Map<string, Problem>();
          farm.questions.forEach((item: ApiQuestion) => {
            if (item.problem && item.solution) {
              const key = item.problem + item.solution;
              if (!problemMap.has(key)) {
                problemMap.set(key, {
                  id: String(problemMap.size + 1).padStart(2, '0'),
                  problem: item.problem,
                  solution: item.solution,
                });
              }
            }
          });

          return {
            regCode: farm.regCode,
            questions: questions,
            problems: Array.from(problemMap.values()),
            completedQuestions: `${completedCount}/${questions.length} Questions`
          };
        });

        this.farmNav.total = this.farmsData.length;
        this.farmNav.current = 1;

        const completedFarms = this.farmsData.filter(farm => {
          const completed = farm.questions.filter(q => q.status === 'Completed').length;
          return completed === farm.questions.length;
        }).length;
        this.jobData.completedFarms = `${completedFarms}/${this.farmsData.length} Farms`;

        this.loadFarmData();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
      },
    });
  }

  loadFarmData() {
    if (this.farmsData.length === 0) return;

    const currentFarm = this.farmsData[this.farmNav.current - 1];
    this.farmNav.farmId = currentFarm.regCode;
    this.farmNav.completedQuestions = currentFarm.completedQuestions;
    this.questions = currentFarm.questions;
    this.problems = currentFarm.problems;
  }

  onBack() {
    history.back();
  }

  prevFarm() {
    if (this.farmNav.current > 1) {
      this.farmNav.current--;
      this.loadFarmData();
    }
  }

  nextFarm() {
    if (this.farmNav.current < this.farmNav.total) {
      this.farmNav.current++;
      this.loadFarmData();
    }
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

interface ApiQuestion {
  type: string;
  problem: string | null;
  qEnglish: string;
  solution: string | null;
  uploadImage: string | null;
  officerTickResult: number;
}

interface ApiFarm {
  regCode: string;
  questions: ApiQuestion[];
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

interface FarmData {
  regCode: string;
  questions: Question[];
  problems: Problem[];
  completedQuestions: string;
}