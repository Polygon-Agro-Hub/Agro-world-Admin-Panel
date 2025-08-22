import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDistributionOfficerComponent } from './view-distribution-officer.component';

describe('ViewDistributionOfficerComponent', () => {
  let component: ViewDistributionOfficerComponent;
  let fixture: ComponentFixture<ViewDistributionOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDistributionOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDistributionOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
