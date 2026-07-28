import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import lottie, { AnimationItem } from 'lottie-web';

interface ShortageItem {
  id: number;
  name: string;
  image: string;
  shortageQty: number;
  assignedQty: number;
  unit: string;
  marketPrice: number;
}

@Component({
  selector: 'app-shortage-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortage-today.component.html',
  styleUrl: './shortage-today.component.css'
})
export class ShortageTodayComponent implements OnInit, AfterViewInit, OnDestroy {
  shortages: ShortageItem[] = [
    {
      id: 1,
      name: 'Garlic',
      image: '/assets/images/garlic.png',
      shortageQty: 20,
      assignedQty: 0,
      unit: 'kg',
      marketPrice: 100.00
    },
    {
      id: 2,
      name: 'Turmeric',
      image: '/assets/images/turmeric.png',
      shortageQty: 0.5,
      assignedQty: 20,
      unit: 'kg',
      marketPrice: 100.00
    },
    {
      id: 3,
      name: 'Watermelon',
      image: '/assets/images/watermelon.png',
      shortageQty: 0,
      assignedQty: 20,
      unit: 'kg',
      marketPrice: 100.00
    }
  ];

  get shortageCount(): number {
    return this.shortages.length;
  }

  availableDate: Date = new Date('2026-06-23T18:00:00');

  // true  -> still before availableDate, show "Please Wait"
  // false -> availableDate has passed, show real state (empty or list)
  isWaiting = true;

  loadingOptions: any = {
    path: '/assets/json/blue_loading.json',
    loop: true,
    autoplay: true
  };

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
      // Automatically flip to the real state once the wait time is reached
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
    this.location.back();
  }

  onView(item: ShortageItem): void {
    console.log('View clicked for', item.name);
    // navigate to detail view or open a modal here
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