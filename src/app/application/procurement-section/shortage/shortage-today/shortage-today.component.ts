import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-shortage-today',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortage-today.component.html',
  styleUrl: './shortage-today.component.css'
})
export class ShortageTodayComponent implements AfterViewInit, OnDestroy {
  shortageCount = 0;
  shortages: any[] = [];

  availableDate: Date = new Date('2026-06-23T18:00:00');

  loadingOptions: any = {
    path: '/assets/json/blue_loading.json',
    loop: true,
    autoplay: true
  };

  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;
  private animationItem: AnimationItem | undefined;

  constructor(private location: Location) {}

  ngAfterViewInit(): void {
    if (this.shortageCount === 0 && this.lottieContainer) {
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
  }

  goBack(): void {
    this.location.back();
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