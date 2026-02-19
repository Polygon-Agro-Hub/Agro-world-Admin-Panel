import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGoviLinkJobsFarmerAuditResponseComponent } from './view-govi-link-jobs-farmer-audit-response.component';

describe('ViewGoviLinkJobsFarmerAuditResponseComponent', () => {
  let component: ViewGoviLinkJobsFarmerAuditResponseComponent;
  let fixture: ComponentFixture<ViewGoviLinkJobsFarmerAuditResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGoviLinkJobsFarmerAuditResponseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGoviLinkJobsFarmerAuditResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
