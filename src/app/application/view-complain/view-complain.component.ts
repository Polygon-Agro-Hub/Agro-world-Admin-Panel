import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-complain',
  standalone: true,
  imports: [CommonModule,DropdownModule],
  templateUrl: './view-complain.component.html',
  styleUrl: './view-complain.component.css'
})
export class ViewComplainComponent {
status: any[]|undefined;
statusFilter: any;
hasData: boolean = true;
}
