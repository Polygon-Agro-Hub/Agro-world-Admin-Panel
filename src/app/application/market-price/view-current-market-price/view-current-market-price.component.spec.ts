import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCurrentMarketPriceComponent } from './view-current-market-price.component';

describe('ViewCurrentMarketPriceComponent', () => {
  let component: ViewCurrentMarketPriceComponent;
  let fixture: ComponentFixture<ViewCurrentMarketPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCurrentMarketPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCurrentMarketPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
