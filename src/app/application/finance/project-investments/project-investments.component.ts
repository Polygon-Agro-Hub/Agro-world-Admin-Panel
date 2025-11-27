// project-investments.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ProjectInvestment {
  name: string;
  code: string;
  invested: number;
  contacts: string[];
}

@Component({
  selector: 'app-project-investments',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './project-investments.component.html',
  styleUrl: './project-investments.component.css',
})
export class ProjectInvestmentsComponent {
  isLoading = false;
  searchTerm = '';

  projectInvestments: ProjectInvestment[] = [
    {
      name: 'Baby Carrot',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Carrot',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Egg Plant',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Ginger',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Grapes',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Lettuce',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Lime',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Pumpkin',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Strawberry',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
    {
      name: 'Thithbatu',
      code: 'GC000001',
      invested: 90,
      contacts: ['+94 78 6767 800'],
    },
  ];

  filteredProjects: ProjectInvestment[] = [...this.projectInvestments];

  constructor(private router: Router) {}

  Back(): void {
    this.router.navigate([
      '/finance/action/finance-govicapital/ivesment-requests',
    ]);
  }

  filterProjects(): void {
    if (!this.searchTerm) {
      this.filteredProjects = [...this.projectInvestments];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projectInvestments.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.code.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProjects = [...this.projectInvestments];
  }
}
