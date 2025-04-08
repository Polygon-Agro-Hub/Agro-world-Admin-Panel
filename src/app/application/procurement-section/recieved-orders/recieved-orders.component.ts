import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-recieved-orders',
  standalone: true,
  imports: [CommonModule,
        HttpClientModule,
        NgxPaginationModule,
        DropdownModule,
        FormsModule,
        LoadingSpinnerComponent],
  templateUrl: './recieved-orders.component.html',
  styleUrl: './recieved-orders.component.css'
})
export class RecievedOrdersComponent {
  search: string = '';
  isLoading = false;


constructor(
  private procumentService: ProcumentsService,
  private router: Router,
  public tokenService: TokenService,
  public permissionService: PermissionService,
) {}




onPageChange(event: number) {
 
}



clearSearch(): void {
  this.search = '';

}



applysearch() {

}



back(): void {
  this.router.navigate(['/procurement']);
}
}
