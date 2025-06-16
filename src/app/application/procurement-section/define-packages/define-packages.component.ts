import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TodoDefinePackagesComponent } from '../todo-define-packages/todo-define-packages.component';

@Component({
  selector: 'app-define-packages',
  standalone: true,
  imports: [CommonModule, HttpClientModule, TodoDefinePackagesComponent],
  templateUrl: './define-packages.component.html',
  styleUrl: './define-packages.component.css',
})
export class DefinePackagesComponent {
  isPremade = true;
  activeTab: string = 'todo';

  constructor(private router: Router) {}

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
