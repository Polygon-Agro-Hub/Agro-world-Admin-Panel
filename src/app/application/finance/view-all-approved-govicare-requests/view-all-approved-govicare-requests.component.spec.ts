import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllApprovedGovicareRequestsComponent } from './view-all-approved-govicare-requests.component';

describe('ViewAllApprovedGovicareRequestsComponent', () => {
  let component: ViewAllApprovedGovicareRequestsComponent;
  let fixture: ComponentFixture<ViewAllApprovedGovicareRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllApprovedGovicareRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllApprovedGovicareRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
