import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllAuditedGovicareRequestsComponent } from './view-all-audited-govicare-requests.component';

describe('ViewAllAuditedGovicareRequestsComponent', () => {
  let component: ViewAllAuditedGovicareRequestsComponent;
  let fixture: ComponentFixture<ViewAllAuditedGovicareRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllAuditedGovicareRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllAuditedGovicareRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
