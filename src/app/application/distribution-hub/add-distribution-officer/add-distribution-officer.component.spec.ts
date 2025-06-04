import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDistributionOfficerComponent } from './add-distribution-officer.component';

describe('AddDistributionOfficerComponent', () => {
  let component: AddDistributionOfficerComponent;
  let fixture: ComponentFixture<AddDistributionOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDistributionOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDistributionOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
