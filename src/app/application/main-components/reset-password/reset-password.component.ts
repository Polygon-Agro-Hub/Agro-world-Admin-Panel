import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm!: FormGroup;
  countdown: number = 180; // 3 minutes
  timer: any;
  expired: boolean = false;
  token: string | null = null;
  email: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // get token from URL
    this.token = this.route.snapshot.paramMap.get('token');

    this.resetForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.expired = true;
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // toggle methods
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notMatching: true };
  }

  // 🔹 Reset Password
  onSubmit() {
    if (this.resetForm.valid && this.token) {
      const newPassword = this.resetForm.value.password;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Password Updated',
            text: res.message || 'Password has been updated successfully',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: err.error?.message || 'Something went wrong',
          });
        },
      });
    }
  }

  // 🔹 Resend Link
  resendLink() {
    if (!this.email) {
      Swal.fire({
        icon: 'info',
        title: 'Need Email',
        text: 'Please go through forgot password again.',
      });
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Link Sent',
          text: 'Password reset link has been resent to your email.',
        });
        this.countdown = 180;
        this.expired = false;
        this.startTimer();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Resend Failed',
          text: err.error?.message || 'Unable to resend link',
        });
      },
    });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
