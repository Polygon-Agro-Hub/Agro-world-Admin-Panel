import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllCertificatePaymentsComponent } from './view-all-certificate-payments.component';

describe('ViewAllCertificatePaymentsComponent', () => {
  let component: ViewAllCertificatePaymentsComponent;
  let fixture: ComponentFixture<ViewAllCertificatePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllCertificatePaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllCertificatePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
