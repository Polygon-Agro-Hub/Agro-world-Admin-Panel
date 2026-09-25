import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
interface MismatchItem {
  id: number;
  name: string;
  image: string;
  grade: string;
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
  transportId: number | null;
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
export class ProcumentProductMismatchTodayComponent implements OnInit {
  loadedItemId!: number;

  mismatch: MismatchHeader = {
    id: '',
    transportId: null,
    loadedFrom: '',
    loadedTime: '',
    unloadedTime: '',
    driver: { id: '', name: '', phone: '' },
    officer: { id: '', name: '', phone: '' },
  };

  mismatchItems: MismatchItem[] = [];

  isLoading = false;
  loadError = '';

  // Modal state
  showApproveModal = false;
  recommendation = '';
  isSubmitting = false;

  constructor(
    private procumentsService: ProcumentsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('loadedItemId');
    this.loadedItemId = Number(idParam);

    if (!this.loadedItemId) {
      this.loadError = 'No loaded item specified.';
      return;
    }

    this.fetchTransportLoadFullDetails();
  }

  fetchTransportLoadFullDetails(): void {
    this.isLoading = true;
    this.loadError = '';

    this.procumentsService
      .getTransportLoadFullDetails(this.loadedItemId)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const details = res?.results?.transportDetails;
          const weightSummary = res?.results?.weightSummary ?? [];

          if (!details) {
            this.loadError = 'No transport load details found.';
            return;
          }

          this.mismatch = {
            id: details.transferCode ?? '',
            transportId: details.transportId ?? null,
            loadedFrom: details.centerName ?? '',
            loadedTime: details.createdAt
              ? new Date(details.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            unloadedTime: details.unloadTime
              ? new Date(details.unloadTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            driver: {
              id: details.driverEmpId ?? '',
              name: [details.driverFirstName, details.driverLastName]
                .filter(Boolean)
                .join(' '),
              phone: details.driverPhone
                ? `${details.driverPhoneCode ?? ''}${details.driverPhone}`
                : '',
            },
            officer: {
              id: details.unloadOfficerEmpId ?? '',
              name: [
                details.unloadOfficerFirstName,
                details.unloadOfficerLastName,
              ]
                .filter(Boolean)
                .join(' '),
              phone: details.unloadOfficerPhone
                ? `${details.unloadOfficerPhoneCode ?? ''}${details.unloadOfficerPhone}`
                : '',
            },
          };

          this.mismatchItems = weightSummary.map((row: any, index: number) => ({
            id: row.loadedItemId ?? index,
            name: row.varietyNameEnglish ?? '',
            image: row.image ?? '',
            grade: row.grade ?? '',
            loadedCrates: Number(row.totalLoadedCrates ?? 0),
            unloadedCrates: Number(row.totalUnloadedCrates ?? 0),
            loadedWeight: Number(row.totalLoadedWeight ?? 0),
            unloadedWeight: Number(row.totalUnloadedWeight ?? 0),
          }));
        },
        error: (err) => {
          this.isLoading = false;
          this.loadError =
            'Failed to load transport details. Please try again.';
          console.error('Error in fetchTransportLoadFullDetails:', err);
        },
      });
  }

  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  call(phone: string): void {
    if (!phone) return;
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

    if (!this.mismatch.transportId) {
      console.error('Missing transportId — cannot submit recommendation.');
      return;
    }

    this.isSubmitting = true;

    this.procumentsService
      .updateTransportLoadRecommendation(
        this.mismatch.transportId,
        this.recommendation.trim(),
      )
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeApproveModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error in submitApproval:', err);
        },
      });
  }
}
