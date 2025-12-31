import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInvestmentsTransactionsComponent } from './project-investments-transactions.component';

describe('ProjectInvestmentsTransactionsComponent', () => {
  let component: ProjectInvestmentsTransactionsComponent;
  let fixture: ComponentFixture<ProjectInvestmentsTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInvestmentsTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectInvestmentsTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
