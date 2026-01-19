import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterHomeDeliveryOrdersComponent } from './center-home-delivery-orders.component';

describe('CenterHomeDeliveryOrdersComponent', () => {
  let component: CenterHomeDeliveryOrdersComponent;
  let fixture: ComponentFixture<CenterHomeDeliveryOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterHomeDeliveryOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterHomeDeliveryOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
