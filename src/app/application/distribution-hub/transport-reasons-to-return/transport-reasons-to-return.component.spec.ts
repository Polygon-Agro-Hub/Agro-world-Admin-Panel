import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportReasonsToReturnComponent } from './transport-reasons-to-return.component';

describe('TransportReasonsToReturnComponent', () => {
  let component: TransportReasonsToReturnComponent;
  let fixture: ComponentFixture<TransportReasonsToReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportReasonsToReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransportReasonsToReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
