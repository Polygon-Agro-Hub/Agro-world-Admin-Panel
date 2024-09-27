import { Component,OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-collectiveofficers-bank-details',
  standalone: true,
  imports: [ReactiveFormsModule,HttpClientModule],
  templateUrl: './collectiveofficers-bank-details.component.html',
  styleUrl: './collectiveofficers-bank-details.component.css'
})



export class CollectiveofficersBankDetailsComponent implements OnInit{
  ngOnInit(){

  }

}
