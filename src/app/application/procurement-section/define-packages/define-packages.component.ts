import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoDefinePackagesComponent } from '../todo-define-packages/todo-define-packages.component';
import { CompletedDefinePackageComponent } from '../completed-define-package/completed-define-package.component';
import { ViewSendToDispatchComponent } from '../view-send-to-dispatch/view-send-to-dispatch.component';
@Component({
  selector: 'app-define-packages',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TodoDefinePackagesComponent,
    CompletedDefinePackageComponent,
    ViewSendToDispatchComponent,
  ],
  templateUrl: './define-packages.component.html',
  styleUrl: './define-packages.component.css',
})
export class DefinePackagesComponent implements OnInit {
  isPremade = true;
  activeTab: string = 'todo';

  constructor(private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      // if (tab === 'completed') {
      //   this.activeTab = 'completed'
      // } else
      if (tab === 'sent') {
        this.activeTab = 'sent'
      } else {
        this.activeTab = 'todo'
      }
    });
  }

  back(): void {
    this.router.navigate(['/procurement']);
  }

  togglePackageType(isPremade: boolean) {
    this.isPremade = isPremade;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}

