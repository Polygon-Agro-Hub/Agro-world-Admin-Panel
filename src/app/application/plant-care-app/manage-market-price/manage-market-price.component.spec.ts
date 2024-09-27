import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMarketPriceComponent } from './manage-market-price.component';

describe('ManageMarketPriceComponent', () => {
  let component: ManageMarketPriceComponent;
  let fixture: ComponentFixture<ManageMarketPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMarketPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageMarketPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
