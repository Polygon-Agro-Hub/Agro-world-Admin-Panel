import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { AllPikupOdersComponent } from '../all-pikup-oders/all-pikup-oders.component';
import { ReadyToPikupComponent } from '../ready-to-pikup/ready-to-pikup.component';
import { PikupOdersComponent } from '../pikup-oders/pikup-oders.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pikup-oder-records-main',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    AllPikupOdersComponent,
    ReadyToPikupComponent,
    PikupOdersComponent,
  ],
  templateUrl: './pikup-oder-records-main.component.html',
  styleUrl: './pikup-oder-records-main.component.css',
})
export class PikupOderRecordsMainComponent {
  activeTab: string = 'All';

  constructor(private router: Router, private route: ActivatedRoute) {}

  setActiveTab(tab: string) {
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }
}
