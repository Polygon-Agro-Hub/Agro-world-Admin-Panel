import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketManageSeoComponent } from './market-manage-seo.component';

describe('MarketManageSeoComponent', () => {
  let component: MarketManageSeoComponent;
  let fixture: ComponentFixture<MarketManageSeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketManageSeoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketManageSeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
