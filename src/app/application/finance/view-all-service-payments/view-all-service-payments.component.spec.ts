import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllServicePaymentsComponent } from './view-all-service-payments.component';

describe('ViewAllServicePaymentsComponent', () => {
  let component: ViewAllServicePaymentsComponent;
  let fixture: ComponentFixture<ViewAllServicePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllServicePaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllServicePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
