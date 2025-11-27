import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInvestmentsComponent } from './project-investments.component';

describe('ProjectInvestmentsComponent', () => {
  let component: ProjectInvestmentsComponent;
  let fixture: ComponentFixture<ProjectInvestmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInvestmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectInvestmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
