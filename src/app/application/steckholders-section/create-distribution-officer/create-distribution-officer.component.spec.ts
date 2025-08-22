import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDistributionOfficerComponent } from './create-distribution-officer.component';

describe('CreateDistributionOfficerComponent', () => {
  let component: CreateDistributionOfficerComponent;
  let fixture: ComponentFixture<CreateDistributionOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDistributionOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDistributionOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
