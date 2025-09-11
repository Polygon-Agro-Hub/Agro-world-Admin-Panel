import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmersFarmsFixedAssetsBuildingComponent } from './farmers-farms-fixed-assets-building.component';

describe('FarmersFarmsFixedAssetsBuildingComponent', () => {
  let component: FarmersFarmsFixedAssetsBuildingComponent;
  let fixture: ComponentFixture<FarmersFarmsFixedAssetsBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmersFarmsFixedAssetsBuildingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmersFarmsFixedAssetsBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
