import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-market-manage-seo',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './market-manage-seo.component.html',
  styleUrl: './market-manage-seo.component.css',
})
export class MarketManageSeoComponent {
  selectedPage: string = 'Promotions Page';
  slug: string = 'https://myfarm.lk/Promotions';
  metaDescription: string = '';
  keywords: string[] = ['Promo', 'Coupons'];
  newKeyword: string = '';
  showBackConfirm = false;

  pageOptions = [
    { label: 'Promotions Page', value: 'Promotions Page' },
    { label: 'Home Page', value: 'Home Page' },
    { label: 'Products Page', value: 'Products Page' },
    { label: 'About Page', value: 'About Page' },
    { label: 'Contact Page', value: 'Contact Page' },
  ];

  pages = [
    'Promotions Page',
    'Home Page',
    'Products Page',
    'About Page',
    'Contact Page',
  ];

  private pageSlugMap: { [key: string]: string } = {
    'Promotions Page': 'https://myfarm.lk/Promotions',
    'Home Page': 'https://myfarm.lk/Home',
    'Products Page': 'https://myfarm.lk/Products',
    'About Page': 'https://myfarm.lk/About',
    'Contact Page': 'https://myfarm.lk/Contact',
  };

  constructor(private router: Router) {}

  onPageChange(value?: string) {
    const page = value ?? this.selectedPage;
    if (page && this.pageSlugMap[page]) {
      this.slug = this.pageSlugMap[page];
      this.selectedPage = page;
    }
  }

  addKeyword() {
    if (
      this.newKeyword.trim() &&
      !this.keywords.includes(this.newKeyword.trim())
    ) {
      this.keywords.push(this.newKeyword.trim());
      this.newKeyword = '';
    }
  }

  removeKeyword(keyword: string) {
    this.keywords = this.keywords.filter((k) => k !== keyword);
  }

  onKeywordKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addKeyword();
    }
  }

  onSave(form?: NgForm) {
    const seoData = {
      page: this.selectedPage,
      slug: this.slug,
      metaDescription: this.metaDescription,
      keywords: this.keywords,
    };

    Swal.fire({
      icon: 'success',
      title: 'Saved',
      text: 'SEO settings saved successfully.',
      timer: 1200,
      showConfirmButton: false,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then(() => {
      this.selectedPage = 'Promotions Page';
      this.onPageChange(this.selectedPage);
      this.metaDescription = '';
      this.keywords = ['Promo', 'Coupons'];
      this.newKeyword = '';

      if (form) {
        form.resetForm({
          page: this.selectedPage,
          slug: this.slug,
          metaDescription: this.metaDescription,
        });
      }
      console.log('SEO Data:', seoData);
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['market/action']);
      }
    });
  }

  goToActions() {
    this.router.navigate(['market/action']);
  }
}
