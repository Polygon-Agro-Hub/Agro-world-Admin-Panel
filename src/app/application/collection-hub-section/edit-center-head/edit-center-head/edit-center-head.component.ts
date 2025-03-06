import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CollectionCenterService } from '../../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';


@Component({
  selector: 'app-edit-center-head',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './edit-center-head.component.html',
  styleUrl: './edit-center-head.component.css'
})
export class EditCenterHeadComponent {

  Id!: number;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private collectionCenterSrv: CollectionCenterService,
    private collectionOfficerService: CollectionOfficerService,
  ) { }

}
