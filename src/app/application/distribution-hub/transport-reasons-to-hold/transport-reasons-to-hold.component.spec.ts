import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportReasonsToHoldComponent } from './transport-reasons-to-hold.component';

describe('TransportReasonsToHoldComponent', () => {
  let component: TransportReasonsToHoldComponent;
  let fixture: ComponentFixture<TransportReasonsToHoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportReasonsToHoldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransportReasonsToHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
