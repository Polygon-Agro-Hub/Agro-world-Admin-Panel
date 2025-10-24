import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCentreRequirementComponent } from './view-centre-requirement.component';

describe('ViewCentreRequirementComponent', () => {
  let component: ViewCentreRequirementComponent;
  let fixture: ComponentFixture<ViewCentreRequirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCentreRequirementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCentreRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
