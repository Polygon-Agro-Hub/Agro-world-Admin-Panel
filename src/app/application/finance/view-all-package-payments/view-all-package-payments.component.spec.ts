import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllPackagePaymentsComponent } from './view-all-package-payments.component';

describe('ViewAllPackagePaymentsComponent', () => {
  let component: ViewAllPackagePaymentsComponent;
  let fixture: ComponentFixture<ViewAllPackagePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllPackagePaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllPackagePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
