import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';
import { ProcumentsService } from '../../../../services/procuments/procuments.service';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component"; // adjust path/name as needed
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
// adjust path/name as needed

interface AssignmentRecord {
  qty: number;
  centreLabel: string;
  ceiling: number;
}

interface ShortageItem {
  id: number;
  name: string;
  image: string;
  shortageQty: number;
  assignedQty: number;
  marketPrice: number;
  assignments: AssignmentRecord[];
}

@Component({
  selector: 'app-shortage-today',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './shortage-today.component.html',
  styleUrl: './shortage-today.component.css',
})
export class ShortageTodayComponent
  implements OnInit, AfterViewInit, OnDestroy {
  shortages: ShortageItem[] = [];

  availableDate: Date = new Date();
  isWaiting = true;
  isLoading = false;

  loadingOptions: any = {
    path: '/assets/json/blue_loading.json',
    loop: true,
    autoplay: true,
  };

  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;
  private animationItem: AnimationItem | undefined;
  private waitTimer: any;

  constructor(
    private location: Location,
    private router: Router,
    private procumentService: ProcumentsService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
  ) { }

  get shortageCount(): number {
    return this.shortages.length;
  }

  ngOnInit(): void {
    const now = new Date();
    const target = new Date(now);
    target.setHours(18, 0, 0, 0);
    this.availableDate = target;

    if (now.getTime() >= target.getTime()) {
      this.isWaiting = false;
      this.fetchShortageDetails();
    } else {
      this.isWaiting = true;
      this.waitTimer = setTimeout(() => {
        this.isWaiting = false;
        this.animationItem?.destroy();
        this.fetchShortageDetails();
      }, target.getTime() - now.getTime());
    }
  }

  fetchShortageDetails(): void {
    this.isLoading = true;
    this.procumentService.getShortageDetails().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        this.shortages = data.map((item: any) => ({
          id: item.id,
          name: item.displayName,
          image: item.image,
          shortageQty: item.shortageQty,
          assignedQty: item.totalAssignedQty,
          unit: item.unitType || 'kg',
          marketPrice: item.buyPrice,
          assignments: [],
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching shortage details:', err);
        this.isLoading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.isWaiting && this.lottieContainer) {
      this.animationItem = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: this.loadingOptions.loop,
        autoplay: this.loadingOptions.autoplay,
        path: this.loadingOptions.path,
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
    this.location.back();
  }

  onView(item: ShortageItem): void {
    this.router.navigate(['procurement/shortage-assign', item.id]);
  }

  get formattedTime(): string {
    return this.availableDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  formatNumber(value: number): string {
    // Convert to string and remove trailing zeros
    return value.toString().replace(/\.?0+$/, '');
  }
}