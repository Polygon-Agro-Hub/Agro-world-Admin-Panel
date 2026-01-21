import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-job-history-farmer-cluster-audit-response',
  standalone: true,
  imports: [CommonModule,LoadingSpinnerComponent],
  templateUrl: './view-job-history-farmer-cluster-audit-response.component.html',
  styleUrl: './view-job-history-farmer-cluster-audit-response.component.css'
})
export class ViewJobHistoryFarmerClusterAuditResponseComponent implements OnInit {
 
  isLoading = false;
  isModalOpen = false;
  modalImage = '';
  modalTitle = '';
  scale = 1;

  jobId!: string;

  // --- Sample Data (Matches Screenshot) ---

  // Job Header Info
  jobData = {
    jobId: 'CA20251020001',
    certificate: 'GAP Certification for farmer Cluster',
    completedFarms: '2/10 Farms',
  };

  // Farm Navigation Info
  farmNav = {
    current: 1,
    total: 2,
    farmId: '998-50000-702',
    completedQuestions: '2/3 Questions'
  };

  // Questions List
  questions: Question[] = [
    {
      id: '01',
      type: 'Tick Off',
      question: 'Do you store harvested produce in clean containers that are free from chemicals and contaminants?',
      status: 'Completed',
      hasPhoto: false
    },
    {
      id: '02',
      type: 'Photo - Proof',
      question: 'Do you store harvested produce in clean containers that are free from chemicals and contaminants?',
      status: 'Incomplete',
      hasPhoto: false // Set to true to test button visibility if needed, screenshot showed incomplete here
    },
    {
      id: '03',
      type: 'Photo - Proof',
      question: 'Do you store harvested produce in clean containers that are free from chemicals and contaminants? Do you store harvested produce in clean containers that are free from chemicals and contaminants?',
      status: 'Completed',
      hasPhoto: true,
      photoUrl: 'assets/sample.jpg'
    }
  ];

  // Problems List (Set to empty array [] to see the "No problems" view)
  problems: Problem[] = [
    {
      id: '01',
      problem: 'Water pumps in the irrigation site were frequently breaking down, causing delays.',
      solution: 'Set up a regular maintenance schedule for pumps and provide basic repair training to local operators. Set up a regular maintenance schedule for pumps and provide basic repair training to local operators.'
    },
    {
      id: '02',
      problem: 'Water pumps in the irrigation site were frequently breaking down, causing delays.',
      solution: 'Set up a regular maintenance schedule for pumps and provide basic repair training to local operators. Set up a regular maintenance schedule for pumps and provide basic repair training to local operators.'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  // --- Navigation & Actions ---

  onBack() {
    history.back();
  }

  prevFarm() {
    if(this.farmNav.current > 1) this.farmNav.current--;
  }

  nextFarm() {
    if(this.farmNav.current < this.farmNav.total) this.farmNav.current++;
  }

  // --- Modal Logic ---

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

// Interfaces
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