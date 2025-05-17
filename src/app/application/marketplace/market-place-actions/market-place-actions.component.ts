import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-market-place-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-place-actions.component.html',
  styleUrl: './market-place-actions.component.css'
})
export class MarketPlaceActionsComponent {
  istogglePopupCatalogView = false
  istogglePopupCustomerView = false
  istogglePopupOrderView = false
  istogglePopupCentersView = false
  istogglePopupMarketingView = false
  istogglePopupAnalyticsView = false
  istogglePopupMediaView = false


  togglePopupCatalog() {
    this.istogglePopupCatalogView = !this.istogglePopupCatalogView

    this.istogglePopupCustomerView = false
    this.istogglePopupOrderView = false
    this.istogglePopupCentersView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupAnalyticsView = false
    this.istogglePopupMediaView = false
  }

  togglePopupCustomer() {
    this.istogglePopupCustomerView = !this.istogglePopupCustomerView

    this.istogglePopupCatalogView = false
    this.istogglePopupOrderView = false
    this.istogglePopupCentersView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupAnalyticsView = false
    this.istogglePopupMediaView = false
  }

  togglePopupOrder() {
    this.istogglePopupOrderView = !this.istogglePopupOrderView

    this.istogglePopupCatalogView = false
    this.istogglePopupCustomerView = false
    this.istogglePopupCentersView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupAnalyticsView = false
    this.istogglePopupMediaView = false
  }

  togglePopupCenters() {
    this.istogglePopupCentersView = !this.istogglePopupCentersView

    this.istogglePopupCatalogView = false
    this.istogglePopupCustomerView = false
    this.istogglePopupOrderView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupAnalyticsView = false
    this.istogglePopupMediaView = false
  }

  togglePopupMarketing() {
    this.istogglePopupMarketingView = !this.istogglePopupMarketingView

    this.istogglePopupCatalogView = false
    this.istogglePopupCustomerView = false
    this.istogglePopupOrderView = false
    this.istogglePopupCentersView = false
    this.istogglePopupAnalyticsView = false
    this.istogglePopupMediaView = false
  }

  togglePopupAnalytics() {
    this.istogglePopupAnalyticsView = !this.istogglePopupAnalyticsView

    this.istogglePopupCatalogView = false
    this.istogglePopupCustomerView = false
    this.istogglePopupOrderView = false
    this.istogglePopupCentersView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupMediaView = false
  }

    togglePopuMedia() {
    this.istogglePopupMediaView = !this.istogglePopupMediaView

    this.istogglePopupCatalogView = false
    this.istogglePopupCustomerView = false
    this.istogglePopupOrderView = false
    this.istogglePopupCentersView = false
    this.istogglePopupMarketingView = false
    this.istogglePopupAnalyticsView = false
  }

  constructor(private router: Router) { }

  navigatePath(path: string) {
    this.router.navigate([path])
  }

}
