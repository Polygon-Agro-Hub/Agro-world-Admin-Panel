import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverResidentialBankInfoComponent } from './driver-residential-bank-info.component';

describe('DriverResidentialBankInfoComponent', () => {
  let component: DriverResidentialBankInfoComponent;
  let fixture: ComponentFixture<DriverResidentialBankInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverResidentialBankInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverResidentialBankInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
