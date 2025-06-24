import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDistributionOfficerComponent } from './edit-distribution-officer.component';

describe('EditDistributionOfficerComponent', () => {
  let component: EditDistributionOfficerComponent;
  let fixture: ComponentFixture<EditDistributionOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDistributionOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditDistributionOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
