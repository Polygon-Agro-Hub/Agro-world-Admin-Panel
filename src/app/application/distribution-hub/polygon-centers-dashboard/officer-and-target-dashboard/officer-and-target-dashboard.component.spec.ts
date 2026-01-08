import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerAndTargetDashboardComponent } from './officer-and-target-dashboard.component';

describe('OfficerAndTargetDashboardComponent', () => {
  let component: OfficerAndTargetDashboardComponent;
  let fixture: ComponentFixture<OfficerAndTargetDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerAndTargetDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OfficerAndTargetDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
