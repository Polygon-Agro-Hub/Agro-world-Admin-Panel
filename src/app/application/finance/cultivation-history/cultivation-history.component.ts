import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerPensionService } from '../../../services/plant-care/farmer-pension.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { ActivatedRoute } from '@angular/router';

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
export class CultivationHistoryComponent implements OnInit {
  userId!: string;
  nic: string = '';
  cultivationArray: ICultivation[] = [];

  isLoading = true;
  hasData = false;

  constructor(
    private farmerPensionService: FarmerPensionService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.nic = this.route.snapshot.queryParams['nic'] || '';
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.farmerPensionService.getPensionForCultivation(this.userId).subscribe(
      (res) => {
        if (res.status) {
          this.cultivationArray = res.data;
          this.hasData = this.cultivationArray.length > 0;
          this.isLoading = false;
        } else {
          this.hasData = false;
          this.isLoading = false;
        }
      }
    )
  }

  calPrograss(complete: number, total: number): number {
    return Math.round((complete / total) * 100);
  }
}

interface ICultivation {
  ongoingCultivationId: number;
  varietyNameEnglish: string;
  cropNameEnglish: string;
  extentac: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}