import { Component, OnInit } from '@angular/core';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-selected-complain',
  standalone: true,
  imports: [],
  templateUrl: './view-selected-complain.component.html',
  styleUrl: './view-selected-complain.component.css',
  providers: [DatePipe] // Add DatePipe to providers
})
export class ViewSelectedComplainComponent implements OnInit {
  complain: Complain = new Complain();
  complainId!: string;

  constructor(
    private complainSrv: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe 
  ) {}

  fetchComplain() {
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt = this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') || res.createdAt;
      this.complain = res;
      console.log(res);
    });
  }

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    this.fetchComplain();
  }
}

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  officerName!: string;
  farmerName!: string;
  officerPhone!: string;
  farmerPhone!: string;
  complain!: string;
  language!: string;
  createdAt!: string;
}
