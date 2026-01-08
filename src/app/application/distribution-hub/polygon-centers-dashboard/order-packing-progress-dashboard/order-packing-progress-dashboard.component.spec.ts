import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPackingProgressDashboardComponent } from './order-packing-progress-dashboard.component';

describe('OrderPackingProgressDashboardComponent', () => {
  let component: OrderPackingProgressDashboardComponent;
  let fixture: ComponentFixture<OrderPackingProgressDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPackingProgressDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderPackingProgressDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
