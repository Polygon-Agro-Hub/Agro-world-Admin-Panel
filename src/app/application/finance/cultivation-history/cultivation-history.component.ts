import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cultivation {
  no: string;
  crop: string;
  variety: string;
  extent: number;
  progress: number;
  startedDate: string;
}

@Component({
  selector: 'app-cultivation-history',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './cultivation-history.component.html',
  styleUrl: './cultivation-history.component.css',
})
export class CultivationHistoryComponent {
  isLoading = false;

  cultivations: Cultivation[] = [
    {
      no: '001',
      crop: 'Brocolli',
      variety: 'Brocolli-1',
      extent: 11,
      progress: 50,
      startedDate: 'June 11, 2026',
    },
    {
      no: '002',
      crop: 'Pumpkin',
      variety: 'Pumpkin-1',
      extent: 4,
      progress: 0,
      startedDate: 'June 01, 2026',
    },
    {
      no: '003',
      crop: 'Tomato',
      variety: 'Tomato-1',
      extent: 16,
      progress: 100,
      startedDate: 'June 01, 2026',
    },
  ];
}