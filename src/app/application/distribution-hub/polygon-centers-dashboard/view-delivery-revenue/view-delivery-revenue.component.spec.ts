import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryRevenueComponent } from './view-delivery-revenue.component';

describe('ViewDeliveryRevenueComponent', () => {
  let component: ViewDeliveryRevenueComponent;
  let fixture: ComponentFixture<ViewDeliveryRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryRevenueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDeliveryRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
