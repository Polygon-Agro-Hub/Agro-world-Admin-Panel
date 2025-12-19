import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionViewCustomerOrdersComponent } from './distribution-view-customer-orders.component';

describe('DistributionViewCustomerOrdersComponent', () => {
  let component: DistributionViewCustomerOrdersComponent;
  let fixture: ComponentFixture<DistributionViewCustomerOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionViewCustomerOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionViewCustomerOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
