import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-premade-packages',
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-premade-packages.component.html',
  styleUrl: './view-premade-packages.component.css'
})
export class ViewPremadePackagesComponent implements OnInit{
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  hasData = false;
  isLoading:boolean = false;

}
