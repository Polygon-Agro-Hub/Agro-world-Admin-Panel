import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-count-down',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './count-down.component.html',
  styleUrl: './count-down.component.css',
})
export class CountDownComponent implements OnInit, OnDestroy {
  @Input() duration: number = 30;
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  timeLeft: number = this.duration;
  interval: any;
  radius: number = 60;
  circumference: number = 2 * Math.PI * this.radius;

  ngOnInit(): void {
    this.timeLeft = this.duration;
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.interval);
        this.completed.emit(); // Emit event to parent
      }
    }, 1000);
  }

  markAsCompleted() {
    clearInterval(this.interval);
    this.completed.emit();
  }

  goBackToEdit() {
    clearInterval(this.interval);
    this.cancelled.emit();
  }

  get dashOffset(): number {
    const progress = this.timeLeft / this.duration;
    return this.circumference * (1 - progress);
  }

  get formattedTime(): string {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${this.pad(mins)}:${this.pad(secs)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
