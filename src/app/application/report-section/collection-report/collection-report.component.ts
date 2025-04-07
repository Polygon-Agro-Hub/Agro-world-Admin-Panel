import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionService } from '../../../services/collection.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [CommonModule,
        HttpClientModule,
        NgxPaginationModule,
        DropdownModule,
        FormsModule,
        LoadingSpinnerComponent],
  templateUrl: './collection-report.component.html',
  styleUrl: './collection-report.component.css'
})
export class CollectionReportComponent {

  isLoading = false;


     constructor(
        private collectionoOfficer: CollectionService,
        private router: Router,
        public tokenService: TokenService,
        public permissionService: PermissionService,
     
      ) {}


  back(): void {
    this.router.navigate(['/reports']);
  }
}
