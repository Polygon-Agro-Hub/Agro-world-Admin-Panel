import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';

@Component({
  selector: 'app-market-manage-seo',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './market-manage-seo.component.html',
  styleUrl: './market-manage-seo.component.css',
})
export class MarketManageSeoComponent {
  selectedPage: SeoPayload['pageName'] = 'Retail Home Page';
  slug = 'https://dev.govimart.com/';
  metaDescription = '';
  keywords: string[] = [];
  newKeyword = '';

  pageOptions: { label: SeoPayload['pageName']; value: SeoPayload['pageName'] }[] =
  [
    { label: 'Retail Home Page', value: 'Retail Home Page' },
    { label: 'Wholesale Home Page', value: 'Wholesale Home Page' },
  ];

  private pageSlugMap: Record<SeoPayload['pageName'], string> = {
    'Retail Home Page': 'https://dev.govimart.com/',
    'Wholesale Home Page': 'https://dev.govimart.com/',
  };

  constructor(
    private router: Router,
    private marketPlaceService: MarketPlaceService
  ) {}

  ngOnInit() {
    this.onPageChange(this.selectedPage);
  }

  onPageChange(page: SeoPayload['pageName']) {
    this.selectedPage = page;
    this.slug = this.pageSlugMap[page];
  }

  addKeyword() {
    const value = this.newKeyword.trim();
    if (value && !this.keywords.includes(value)) {
      this.keywords.push(value);
      this.newKeyword = '';
    }
  }

  removeKeyword(keyword: string) {
    this.keywords = this.keywords.filter(k => k !== keyword);
  }

  onKeywordKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addKeyword();
    }
  }

  onSave(form: NgForm) {
    const payload: SeoPayload = {
      pageName: this.selectedPage,
      slug: this.slug,
      discription: this.metaDescription, 
      keywords: this.keywords,
    };

    this.marketPlaceService.manageSeo(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Saved',
          text: 'SEO settings saved successfully',
          timer: 1200,
          showConfirmButton: false,
        }).then(() => {
          this.resetToDefault(form);
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong',
        });
      },
    });
  }

  private resetToDefault(form: NgForm) {
    this.selectedPage = 'Retail Home Page';
    this.slug = this.pageSlugMap['Retail Home Page'];

    this.metaDescription = '';
    this.keywords = [];
    this.newKeyword = '';

    form.resetForm({
      page: this.selectedPage,
      slug: this.slug,
      metaDescription: '',
    });
  }

  onCancel() {
    this.router.navigate(['market/action']);
  }

  goToActions() {
    this.router.navigate(['market/action']);
  }
}

interface SeoPayload {
  pageName: 'Retail Home Page' | 'Wholesale Home Page';
  slug: string;
  discription: string;
  keywords: string[];
}
