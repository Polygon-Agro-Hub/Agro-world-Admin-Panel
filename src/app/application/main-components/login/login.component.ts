import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword: boolean = false;
  disError: any;
  isLoading = false;

  loginObj: Login;

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private tokenService: TokenService){
      this.loginObj = new Login();
  }

  ngOnInit() {
    localStorage.removeItem('Login Token : ');
  }


 onLogin(){

  this.isLoading = true;

  console.log("Successfully click the button");
  // alert("login success");
  // debugger;

  if (!this.loginObj.email) {
    Swal.fire({
      icon: 'error',
      title: 'Unsuccessful',
      text: 'Email is required',
    });
    this.isLoading = false;
  } 

  if (this.loginObj.email) {
    if (!/\S+@\S+\.\S+/.test(this.loginObj.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Unsuccessful',
        text: 'Please enter a valid email address',
      });
    }
    this.isLoading = false;
  } 
  
 
  

  if(!this.loginObj.password){
    Swal.fire({
      icon: 'error',
      title: 'Unsuccessful',
      text: 'Password is required',
    });
    this.isLoading = false;
  }

  if(!this.loginObj.email && !this.loginObj.password){
    Swal.fire({
      icon: 'error',
      title: 'Unsuccessful',
      text: 'Email and Password is required',
    });
    this.isLoading = false;
  }

  if(this.loginObj.password && this.loginObj.email){
    this.authService.login(this.loginObj.email, this.loginObj.password).subscribe(

      (res: any) => {
        console.log('Market Price updated successfully', res);
        
        Swal.fire({
          icon: 'success',
          title: 'Logged',
          text: 'Successfully Logged In',
          showConfirmButton: false,
          timer: 1500
        });
        localStorage.setItem('Login Token : ', res.token);
        localStorage.setItem('userName:', res.userName);
        localStorage.setItem('userId:', res.userId);
        localStorage.setItem('role:', res.role);
        localStorage.setItem('permissions', JSON.stringify(res.permissions));
        localStorage.setItem('Token Expiration', String(new Date().getTime() + (res.expiresIn * 20))); // Assuming expiresIn is in seconds

        this.tokenService.saveLoginDetails(res.token, res.userName, res.userId, res.role, res.permissions, res.expiresIn);
          this.isLoading = false;
        this.router.navigate(['/steckholders']);
      },
      (error) => {
        console.error('Error updating Market Price', error);
        this.disError = error.error?.error || 'An error occurred. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: this.disError,
        });
        this.isLoading = false;
      }
  );
  }
 }

  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

export class Login{
  email: string;
  password: string;
  
  constructor(){
    this.email='';
    this.password='';
  }


}
