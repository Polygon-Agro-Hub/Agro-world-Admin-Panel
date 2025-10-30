import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmersClustersAuditsComponent } from './farmers-clusters-audits.component';

describe('FarmersClustersAuditsComponent', () => {
  let component: FarmersClustersAuditsComponent;
  let fixture: ComponentFixture<FarmersClustersAuditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmersClustersAuditsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmersClustersAuditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
