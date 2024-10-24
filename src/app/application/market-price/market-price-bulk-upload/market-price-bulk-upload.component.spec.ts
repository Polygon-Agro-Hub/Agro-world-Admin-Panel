import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPriceBulkUploadComponent } from './market-price-bulk-upload.component';

describe('MarketPriceBulkUploadComponent', () => {
  let component: MarketPriceBulkUploadComponent;
  let fixture: ComponentFixture<MarketPriceBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPriceBulkUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketPriceBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
