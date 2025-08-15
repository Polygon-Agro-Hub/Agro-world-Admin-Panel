import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MarketPlacePremadePackagesComponent } from '../market-place-premade-packages/market-place-premade-packages.component';
import { MarketplaceCustomePackageComponent } from '../marketplace-custome-package/marketplace-custome-package.component';

@Component({
  selector: 'app-dispatch-marketplace',
  standalone: true,
  imports: [CommonModule, MarketPlacePremadePackagesComponent, MarketplaceCustomePackageComponent],
  templateUrl: './dispatch-marketplace.component.html',
  styleUrl: './dispatch-marketplace.component.css'
})
export class DispatchMarketplaceComponent {
  isPremade = true;

  constructor(
    private router: Router,
  ) { }

  togglePackageType(isPremade: boolean) {
    this.isPremade = isPremade;
  }

  back(): void {
    this.router.navigate(['/dispatch']);
  }

}
