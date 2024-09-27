import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  
  userName = localStorage.getItem('userName:');
    
  constructor(private elementRef: ElementRef,private router: Router) {}

  

  // ngAfterViewInit() {
  //   const body :HTMLBodyElement | null = document.querySelector('body');
  //   const btn = this.elementRef.nativeElement.querySelector('.btn');
  //   const icon = this.elementRef.nativeElement.querySelector('.btn__icon');
  //   const adminName = 'Admin Name';

  //   function store(value:any){
  //     localStorage.setItem('darkmode', value);
  //   }

  //   function load(){
  //     const darkmode = localStorage.getItem('darkmode');
      
  //     if(!darkmode){
  //       store(false);
  //       icon.classList.add('fa-sun');
  //     } else if(darkmode === 'true'){
  //       body?.classList.add('darkmode');
  //       icon.classList.add('fa-moon');
  //     } else if(darkmode === 'false'){
  //       icon.classList.add('fa-sun');
  //     }
  //   }

  //   load();

  //   btn.addEventListener('click', () => {
  //     body?.classList.toggle('darkmode');
  //     icon.classList.add('animated');
      
  //     store(body?.classList.contains('darkmode'));

  //     if(body?.classList.contains('darkmode')){
  //       icon.classList.remove('fa-sun');
  //       icon.classList.add('fa-moon');
  //     } else {
  //       icon.classList.remove('fa-moon');
  //       icon.classList.add('fa-sun');
  //     }

  //     setTimeout(() => {
  //       icon.classList.remove('animated');
  //     }, 500);
  //   });
  // }
  navigateToCreateAdmin() {
    this.router.navigate(['/admin-users/create-admin-user']);
  }

  editMeAdminUser() {
    this.router.navigate(['/admin-users/edit-admin-me-user']);
  }


}
