import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllPaymentHistoryComponent } from './view-all-payment-history.component';

describe('ViewAllPaymentHistoryComponent', () => {
  let component: ViewAllPaymentHistoryComponent;
  let fixture: ComponentFixture<ViewAllPaymentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllPaymentHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllPaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
