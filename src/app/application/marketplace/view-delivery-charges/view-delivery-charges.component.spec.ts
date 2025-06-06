import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryChargesComponent } from './view-delivery-charges.component';

describe('ViewDeliveryChargesComponent', () => {
  let component: ViewDeliveryChargesComponent;
  let fixture: ComponentFixture<ViewDeliveryChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryChargesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDeliveryChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
