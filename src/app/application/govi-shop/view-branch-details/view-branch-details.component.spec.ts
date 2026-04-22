import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBranchDetailsComponent } from './view-branch-details.component';

describe('ViewBranchDetailsComponent', () => {
  let component: ViewBranchDetailsComponent;
  let fixture: ComponentFixture<ViewBranchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBranchDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewBranchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
