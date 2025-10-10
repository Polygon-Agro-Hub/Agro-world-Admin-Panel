import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent implements OnDestroy {
  email: string = '';
  isLoading: boolean = false;
  countdown: number = 0; // in seconds
  intervalId: any;

  constructor(private authService: AuthService, private router: Router) {}

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (!this.isValidEmail(this.email)) {
      Swal.fire(
        'Invalid Email',
        'Please enter a valid email address.',
        'error'
      );
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire('Success', res.message, 'success');
        this.email = '';
        this.startCountdown(180); // 3 minutes (in seconds)
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Something went wrong!';
        Swal.fire('Error', msg, 'error');
      },
    });
  }

  private startCountdown(seconds: number) {
    this.countdown = seconds;

    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 1000);
  }

  // Format as M:SS
  get countdownText(): string {
    const minutes = Math.floor(this.countdown / 60);
    const secs = this.countdown % 60;
    return `Expires in ${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
