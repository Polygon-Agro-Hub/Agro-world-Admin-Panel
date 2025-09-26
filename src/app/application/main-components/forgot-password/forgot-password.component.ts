import { Component } from '@angular/core';
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
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Simple email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Navigate to login page
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
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Something went wrong!';
        Swal.fire('Error', msg, 'error');
      },
    });
  }
}
