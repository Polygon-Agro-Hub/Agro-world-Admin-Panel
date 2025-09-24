import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmersFarmsFixedAssetsLandComponent } from './farmers-farms-fixed-assets-lands.component';

describe('FarmersFarmsFixedAssetsLandsComponent', () => {
  let component: FarmersFarmsFixedAssetsLandComponent;
  let fixture: ComponentFixture<FarmersFarmsFixedAssetsLandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmersFarmsFixedAssetsLandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmersFarmsFixedAssetsLandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
