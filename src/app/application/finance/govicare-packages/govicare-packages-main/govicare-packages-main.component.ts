import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { GovicarePackagesFirstRowComponent } from '../govicare-packages-first-row/govicare-packages-first-row.component';
import { GovicareAreaChartComponent } from '../govicare-area-chart/govicare-area-chart.component';
import { GovicarePichartComponent } from '../govicare-pichart/govicare-pichart.component';
import { GovicareThurdRowComponent } from '../govicare-thurd-row/govicare-thurd-row.component';

@Component({
  selector: 'app-govicare-packages-main',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    GovicarePackagesFirstRowComponent,
    GovicareAreaChartComponent,
    GovicarePichartComponent,
    GovicareThurdRowComponent,
  ],
  templateUrl: './govicare-packages-main.component.html',
  styleUrl: './govicare-packages-main.component.css',
})
export class GovicarePackagesMainComponent {
  isLoading: boolean = false;
}
