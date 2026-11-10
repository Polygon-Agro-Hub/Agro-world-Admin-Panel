import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverLicenseInsuranceInfoComponent } from './driver-license-insurance-info.component';

describe('DriverLicenseInsuranceInfoComponent', () => {
  let component: DriverLicenseInsuranceInfoComponent;
  let fixture: ComponentFixture<DriverLicenseInsuranceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverLicenseInsuranceInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverLicenseInsuranceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
