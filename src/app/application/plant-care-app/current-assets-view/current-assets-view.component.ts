import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { AssetsService } from '../../../services/plant-care/assets.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface CurrentAssetsView {
  id: number;
  userId: number;
  category: any;
  asset: any;
  brand: any;
  batchNum: any;
  unitVolume: any;
  unit: any;
  volume: any;
  numOfUnit: any;
  unitPrice: any;
  total: any;
  status: any;
  createdAt: string;
}

@Component({
  selector: 'app-current-assets-view',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './current-assets-view.component.html',
  styleUrl: './current-assets-view.component.css',
})
export class CurrentAssetsViewComponent {
  currentAsset: CurrentAssetsView[] = [];

  isLoading = false;

  userId: any | null = null;
  name: string = '';
  category: string = '';
  hasData: boolean = true;

  constructor(
    private assetService: AssetsService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['id'] ? +params['id'] : null;
      this.name = params['fullName'] ? params['fullName'] : null;
      this.category = params['category'] ? params['category'] : null;
    });

    this.loadAssets(this.userId, this.category);
  }

  loadAssets(userId: number, category: any) {
    this.isLoading = true;
    this.assetService.getAllCurrentAsset(userId, category).subscribe(
      (data) => {
        this.isLoading = false;
        console.log('Received items:', data);
        this.currentAsset = data;
        this.hasData = this.currentAsset.length > 0;
      },
      (error) => {
        console.error('Error fetching assets', error);
      }
    );
  }

  viewRecord(
    id: number,
    name: string,
    category: string,
    asset: string,
    unit: string
  ) {
    this.router.navigate(
      ['plant-care/report-farmer-current-assert/record-view'],
      {
        queryParams: { id, name, category, asset, unit },
      }
    );
  }
}
