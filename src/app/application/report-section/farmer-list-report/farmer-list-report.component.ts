import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-farmer-list-report',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './farmer-list-report.component.html',
  styleUrl: './farmer-list-report.component.css'
})
export class FarmerListReportComponent {
  todayDate!:string;

  ngOnInit():void{
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }
}
