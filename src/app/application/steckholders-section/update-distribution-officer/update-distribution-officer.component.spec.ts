import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDistributionOfficerComponent } from './update-distribution-officer.component';

describe('UpdateDistributionOfficerComponent', () => {
  let component: UpdateDistributionOfficerComponent;
  let fixture: ComponentFixture<UpdateDistributionOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateDistributionOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateDistributionOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
