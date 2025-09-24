import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceCustomePackageComponent } from './marketplace-custome-package.component';

describe('MarketplaceCustomePackageComponent', () => {
  let component: MarketplaceCustomePackageComponent;
  let fixture: ComponentFixture<MarketplaceCustomePackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceCustomePackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketplaceCustomePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
