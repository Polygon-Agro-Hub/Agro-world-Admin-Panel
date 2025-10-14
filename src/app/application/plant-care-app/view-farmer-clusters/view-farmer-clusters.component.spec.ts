import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmerClustersComponent } from './view-farmer-clusters.component';

describe('ViewFarmerClustersComponent', () => {
  let component: ViewFarmerClustersComponent;
  let fixture: ComponentFixture<ViewFarmerClustersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFarmerClustersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewFarmerClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
