import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hold-todays-deleveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hold-todays-deleveries.component.html',
  styleUrl: './hold-todays-deleveries.component.css',
})
export class HoldTodaysDeleveriesComponent {}
