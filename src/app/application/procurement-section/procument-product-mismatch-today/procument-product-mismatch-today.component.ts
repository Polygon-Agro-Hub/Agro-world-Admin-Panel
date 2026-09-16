import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MismatchItem {
  id: number;
  name: string;
  image: string;
  grade: 'A' | 'B' | 'C';
  loadedCrates: number;
  unloadedCrates: number;
  loadedWeight: number;
  unloadedWeight: number;
}

interface PersonInfo {
  id: string;
  name: string;
  phone: string;
}

interface MismatchHeader {
  id: string;
  loadedFrom: string;
  loadedTime: string;
  unloadedTime: string;
  driver: PersonInfo;
  officer: PersonInfo;
}

@Component({
  selector: 'app-procument-product-mismatch-today',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './procument-product-mismatch-today.component.html',
  styleUrl: './procument-product-mismatch-today.component.css',
})
export class ProcumentProductMismatchTodayComponent {
  mismatch: MismatchHeader = {
    id: 'L-DRV00001260913001',
    loadedFrom: 'Dambulla Collection Centre',
    loadedTime: '06:10 AM',
    unloadedTime: '10:00 AM',
    driver: {
      id: 'DRV00001',
      name: 'Amal Perera',
      phone: '0771122300',
    },
    officer: {
      id: 'DIO00001',
      name: 'Biman Perera',
      phone: '0771122301',
    },
  };

  mismatchItems: MismatchItem[] = [
    {
      id: 1,
      name: 'Garlic',
      image: 'https://via.placeholder.com/48x48.png?text=Garlic',
      grade: 'A',
      loadedCrates: 10,
      unloadedCrates: 10,
      loadedWeight: 100.0,
      unloadedWeight: 90.0,
    },
    {
      id: 2,
      name: 'Turmeric',
      image: 'https://via.placeholder.com/48x48.png?text=Turmeric',
      grade: 'B',
      loadedCrates: 10,
      unloadedCrates: 9,
      loadedWeight: 200.0,
      unloadedWeight: 120.0,
    },
  ];

  // Modal state
  showApproveModal = false;
  recommendation = '';
  isSubmitting = false;

  back(): void {
    // navigation logic
  }

  call(phone: string): void {
    window.open(`tel:${phone}`);
  }

  sendToApprove(): void {
    this.showApproveModal = true;
    this.recommendation = '';
  }

  closeApproveModal(): void {
    if (this.isSubmitting) return;
    this.showApproveModal = false;
    this.recommendation = '';
  }

  submitApproval(): void {
    if (!this.recommendation.trim() || this.isSubmitting) return;

    this.isSubmitting = true;

    // TODO: replace with actual API call
    // this.mismatchService.sendToApprove(this.mismatch.id, this.recommendation).subscribe({
    //   next: () => {
    //     this.isSubmitting = false;
    //     this.closeApproveModal();
    //   },
    //   error: () => {
    //     this.isSubmitting = false;
    //   }
    // });

    console.log('Approval submitted:', {
      mismatchId: this.mismatch.id,
      recommendation: this.recommendation,
    });

    this.isSubmitting = false;
    this.closeApproveModal();
  }
}