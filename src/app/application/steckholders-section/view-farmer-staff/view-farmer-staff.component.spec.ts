import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmerStaffComponent } from './view-farmer-staff.component';

describe('ViewFarmerStaffComponent', () => {
  let component: ViewFarmerStaffComponent;
  let fixture: ComponentFixture<ViewFarmerStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFarmerStaffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFarmerStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
