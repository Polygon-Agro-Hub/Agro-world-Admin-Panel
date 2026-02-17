import { Component } from '@angular/core';

@Component({
  selector: 'app-call-center-component',
  standalone: true,
  imports: [],
  templateUrl: './call-center-component.component.html',
  styleUrl: './call-center-component.component.css'
})
export class CallCenterComponentComponent {

  acceptCall(): void {
    console.log('Call accepted');
  }

}