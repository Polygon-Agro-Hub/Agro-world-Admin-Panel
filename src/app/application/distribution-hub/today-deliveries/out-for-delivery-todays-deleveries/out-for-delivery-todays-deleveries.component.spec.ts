import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutForDeliveryTodaysDeleveriesComponent } from './out-for-delivery-todays-deleveries.component';

describe('OutForDeliveryTodaysDeleveriesComponent', () => {
  let component: OutForDeliveryTodaysDeleveriesComponent;
  let fixture: ComponentFixture<OutForDeliveryTodaysDeleveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutForDeliveryTodaysDeleveriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutForDeliveryTodaysDeleveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
