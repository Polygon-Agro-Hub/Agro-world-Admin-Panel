import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionHubDashboardComponent } from './distribution-hub-dashboard.component';

describe('DistributionHubDashboardComponent', () => {
  let component: DistributionHubDashboardComponent;
  let fixture: ComponentFixture<DistributionHubDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionHubDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionHubDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
