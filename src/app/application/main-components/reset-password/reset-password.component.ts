import { Component, OnInit } from '@angular/core';
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
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  resendLoading: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
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
  }

  // Toggle password visibility
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

  // Reset Password
  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      const newPassword = this.resetForm.value.password;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (res) => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Password Updated',
            text: res.message || 'Password has been updated successfully',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => this.router.navigate(['/login']));
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: err.error?.message || 'Something went wrong',
          });
        },
      });
    }
  }

  // Resend link
  resendLink() {
    if (!this.token) {
      Swal.fire({
        icon: 'info',
        title: 'Token Missing',
        text: 'Please go through Forgot Password again.',
      });
      return;
    }

    this.resendLoading = true;
    this.authService.resendResetLink(this.token).subscribe({
      next: () => {
        this.resendLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Link Sent',
          text: 'Password reset link has been resent to your email.',
        });
      },
      error: (err) => {
        this.resendLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Resend Failed',
          text: err.error?.message || 'Unable to resend link',
        });
      },
    });
  }
}
