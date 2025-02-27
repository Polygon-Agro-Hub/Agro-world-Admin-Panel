import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-status-451',
  templateUrl: './status-451.component.html',
  styleUrls: ['./status-451.component.css']
})
export class Status451Component {
  message = 'We’re sorry, but this resource is unavailable due to legal restrictions.';
  suggestion = 'Please contact our support for more details or try visiting later.';


  constructor(private router: Router) {}

  // contactSupport() {
  //   // Redirect to the contact page or open a contact modal
  //   this.router.navigate(['/contact']);
  // }

  goBack() {
    // Go back to the previous page
    this.router.navigate(['..']);
  }
}


