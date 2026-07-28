import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import lottie, { AnimationItem } from 'lottie-web';

interface ShortageItem {
  id: number;
  name: string;
  image: string;
  shortageQty: number;
  assignedQty: number;
  unit: string;
  marketPrice: number;
  assignments: AssignmentRecord[];
}

interface Centre {
  id: number;
  code: string;
  name: string;
}

interface AssignmentRecord {
  qty: number;
  centreLabel: string;
  ceiling: number;
}

@Component({
  selector: 'app-shortage-today',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shortage-today.component.html',
  styleUrl: './shortage-today.component.css'
})
export class ShortageTodayComponent implements OnInit, AfterViewInit, OnDestroy {
  shortages: ShortageItem[] = [
    { id: 1, name: 'Garlic', image: '/assets/images/garlic.png', shortageQty: 20, assignedQty: 0, unit: 'kg', marketPrice: 100.00, assignments: [] },
    { id: 2, name: 'Turmeric', image: '/assets/images/turmeric.png', shortageQty: 0.5, assignedQty: 20, unit: 'kg', marketPrice: 100.00, assignments: [] },
    { id: 3, name: 'Watermelon', image: '/assets/images/watermelon.png', shortageQty: 0, assignedQty: 20, unit: 'kg', marketPrice: 100.00, assignments: [] }
  ];

  centres: Centre[] = [
    { id: 1, code: 'D-WPCK-01', name: 'Kollupitiya Central Distribution Centre' },
    { id: 2, code: 'D-WPCK-02', name: 'Kollupitiya Central Distribution Centre' },
    { id: 3, code: 'D-WPCK-03', name: 'Kollupitiya Central Distribution Centre' }
  ];

  get shortageCount(): number {
    return this.shortages.length;
  }

  availableDate: Date = new Date('2026-06-23T18:00:00');
  isWaiting = true;

  loadingOptions: any = {
    path: '/assets/json/blue_loading.json',
    loop: true,
    autoplay: true
  };

  // Assign view state
  selectedItem: ShortageItem | null = null;
  assignQty: number = 0;
  selectedCentreId: number | null = null;
  ceilingPercent: number = 0;

  // Confirmation modal state
  showConfirmModal = false;

  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;
  private animationItem: AnimationItem | undefined;
  private waitTimer: any;

  constructor(private location: Location) {}

  ngOnInit(): void {
    const now = new Date().getTime();
    const target = this.availableDate.getTime();

    if (now >= target) {
      this.isWaiting = false;
    } else {
      this.isWaiting = true;
      this.waitTimer = setTimeout(() => {
        this.isWaiting = false;
        this.animationItem?.destroy();
      }, target - now);
    }
  }

  ngAfterViewInit(): void {
    if (this.isWaiting && this.lottieContainer) {
      this.animationItem = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: this.loadingOptions.loop,
        autoplay: this.loadingOptions.autoplay,
        path: this.loadingOptions.path
      });
    }
  }

  ngOnDestroy(): void {
    this.animationItem?.destroy();
    if (this.waitTimer) {
      clearTimeout(this.waitTimer);
    }
  }

  goBack(): void {
    if (this.selectedItem) {
      this.closeAssignView();
    } else {
      this.location.back();
    }
  }

  onView(item: ShortageItem): void {
    this.selectedItem = item;
    this.resetAssignForm();
  }

  closeAssignView(): void {
    this.selectedItem = null;
  }

  private resetAssignForm(): void {
    this.assignQty = 0;
    this.selectedCentreId = null;
    this.ceilingPercent = 0;
  }

  get canAssign(): boolean {
    return this.assignQty > 0
      && this.assignQty <= (this.selectedItem?.shortageQty ?? 0)
      && this.selectedCentreId !== null;
  }

  get selectedCentre(): Centre | null {
    return this.centres.find(c => c.id === this.selectedCentreId) || null;
  }

  // Step 1: open confirmation modal instead of assigning directly
  onAssign(): void {
    if (!this.canAssign) {
      return;
    }
    this.showConfirmModal = true;
  }

  cancelAssign(): void {
    this.showConfirmModal = false;
  }

  // Step 2: actually perform the assignment
  confirmAssign(): void {
    if (!this.selectedItem || !this.selectedCentre) {
      return;
    }

    const centre = this.selectedCentre;
    const qty = this.assignQty;

    // Add to the "Assigned" list at the bottom
    this.selectedItem.assignments.push({
      qty: qty,
      centreLabel: `${centre.code} ${centre.name}`,
      ceiling: this.ceilingPercent
    });

    // Reduce the remaining shortage quantity at the top
    this.selectedItem.shortageQty = Math.max(0, this.selectedItem.shortageQty - qty);
    this.selectedItem.assignedQty += qty;

    console.log('Assigned', {
      item: this.selectedItem.name,
      qty,
      centre,
      ceiling: this.ceilingPercent
    });
    // TODO: call your API here

    this.showConfirmModal = false;
    this.resetAssignForm();
  }

  get formattedTime(): string {
    return this.availableDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  get formattedDate(): string {
    const day = this.availableDate.getDate();
    const month = this.availableDate.toLocaleString('en-US', { month: 'long' });
    const year = this.availableDate.getFullYear();
    const suffix = this.getDaySuffix(day);
    return `${day}${suffix} ${month} ${year}`;
  }

  private getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}