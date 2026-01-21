import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobHistoryFarmerClusterAuditResponseComponent } from './view-job-history-farmer-cluster-audit-response.component';

describe('ViewJobHistoryFarmerClusterAuditResponseComponent', () => {
  let component: ViewJobHistoryFarmerClusterAuditResponseComponent;
  let fixture: ComponentFixture<ViewJobHistoryFarmerClusterAuditResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewJobHistoryFarmerClusterAuditResponseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewJobHistoryFarmerClusterAuditResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
