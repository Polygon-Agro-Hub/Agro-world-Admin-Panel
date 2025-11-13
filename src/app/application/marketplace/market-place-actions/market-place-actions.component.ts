import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-market-place-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-place-actions.component.html',
  styleUrl: './market-place-actions.component.css',
})
export class MarketPlaceActionsComponent {
  istogglePopupCatalogView = false;
  istogglePopupCustomerView = false;
  istogglePopupOrderView = false;
  istogglePopupCentersView = false;
  istogglePopupMarketingView = false;
  istogglePopupAnalyticsView = false;
  istogglePopupMediaView = false;
  istogglePopupSubscriptionView = false;
  istogglePopupDeliveryChargesView = false;

  constructor(
    private router: Router,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }


  togglePopupCatalog() {
    this.istogglePopupCatalogView = !this.istogglePopupCatalogView;

    this.istogglePopupCustomerView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupCustomer() {
    this.istogglePopupCustomerView = !this.istogglePopupCustomerView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupOrder() {
    this.istogglePopupOrderView = !this.istogglePopupOrderView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupCustomerView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupCenters() {
    this.istogglePopupCentersView = !this.istogglePopupCentersView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupCustomerView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupMarketing() {
    this.istogglePopupMarketingView = !this.istogglePopupMarketingView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupCustomerView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupAnalytics() {
    this.istogglePopupAnalyticsView = !this.istogglePopupAnalyticsView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupCustomerView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopuMedia() {
    this.istogglePopupMediaView = !this.istogglePopupMediaView;

    this.istogglePopupCatalogView = false;
    this.istogglePopupCustomerView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupSubscriptionView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupSubscription() {
    this.istogglePopupSubscriptionView = !this.istogglePopupSubscriptionView;

    this.istogglePopupCustomerView = false;
    this.istogglePopupCatalogView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupDeliveryChargesView = false;
  }

  togglePopupDeliveryCharges() {
    this.istogglePopupDeliveryChargesView =
      !this.istogglePopupDeliveryChargesView;

    this.istogglePopupCustomerView = false;
    this.istogglePopupCatalogView = false;
    this.istogglePopupOrderView = false;
    this.istogglePopupCentersView = false;
    this.istogglePopupMarketingView = false;
    this.istogglePopupAnalyticsView = false;
    this.istogglePopupMediaView = false;
    this.istogglePopupSubscriptionView = false;
  }


  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}
