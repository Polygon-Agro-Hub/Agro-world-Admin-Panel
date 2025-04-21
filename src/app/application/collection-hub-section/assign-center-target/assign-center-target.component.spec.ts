import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCenterTargetComponent } from './assign-center-target.component';

describe('AssignCenterTargetComponent', () => {
  let component: AssignCenterTargetComponent;
  let fixture: ComponentFixture<AssignCenterTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCenterTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignCenterTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
