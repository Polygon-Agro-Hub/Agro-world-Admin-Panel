import { Component } from '@angular/core';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface CurrentAssetsViewRecord {
  id: number;
  currentAssetId: number;
  numOfPlusUnit: any;
  numOfMinUnit: any;
  totalPrice: any;
  createdAt: string;
}

@Component({
  selector: 'app-current-asset-record',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './current-asset-record.component.html',
  styleUrl: './current-asset-record.component.css',
})
export class CurrentAssetRecordComponent {
  isLoading = false;
  hasData: boolean = true;
  currentAssetRecord: CurrentAssetsViewRecord[] = [];
  assetId: any | null = null;
  name: string = '';
  category: string = '';
  asset: string = '';
  unit: string = '';

  constructor(
    private assetService: AssetsService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.assetId = params['id'] ? +params['id'] : null;
      this.name = params['name'] ? params['name'] : null;
      this.category = params['category'] ? params['category'] : null;
      this.asset = params['asset'] ? params['asset'] : null;
      this.unit = params['unit'] ? params['unit'] : null;
    });
    this.loadAssetsRecords(this.assetId);
  }

  loadAssetsRecords(id: number) {
    this.isLoading = true;
    this.assetService.getAllCurrentAssetRecord(id).subscribe(
      (data) => {
        this.isLoading = false;
        console.log('Received items:', data);
        this.currentAssetRecord = data;
        this.hasData = this.currentAssetRecord.length > 0;
      },
      (error) => {
        console.error('Error fetching assets', error);
      }
    );
  }
}
