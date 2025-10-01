import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import { CertificateCompanyService } from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-view-company-details',
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-company-details.component.html',
  styleUrls: ['./view-company-details.component.css'],
})
export class ViewCompanyDetailsComponent implements OnInit {
  isLoading = false;
  companyId!: number;
  company: any;

  constructor(
    private companyService: CertificateCompanyService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.companyId = +params['id'];
      this.loadCompanyDetails();
    });
  }

  private loadCompanyDetails(): void {
    this.isLoading = true;
    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.company = res.company;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/plant-care/action/view-company-list']);
      },
    });
  }

  getFlagUrl(code: string): string {
    return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
  }

    onBack(): void {
    this.location.back();
  }
}
