import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutOfDeliveryComponent } from './out-of-delivery.component';

describe('OutOfDeliveryComponent', () => {
  let component: OutOfDeliveryComponent;
  let fixture: ComponentFixture<OutOfDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutOfDeliveryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutOfDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
