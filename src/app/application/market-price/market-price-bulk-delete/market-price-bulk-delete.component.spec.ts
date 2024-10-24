import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPriceBulkDeleteComponent } from './market-price-bulk-delete.component';

describe('MarketPriceBulkDeleteComponent', () => {
  let component: MarketPriceBulkDeleteComponent;
  let fixture: ComponentFixture<MarketPriceBulkDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketPriceBulkDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarketPriceBulkDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
