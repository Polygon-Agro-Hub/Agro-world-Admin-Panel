import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-manage-company',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './manage-company.component.html',
  styleUrl: './manage-company.component.css'
})
export class ManageCompanyComponent {

}
