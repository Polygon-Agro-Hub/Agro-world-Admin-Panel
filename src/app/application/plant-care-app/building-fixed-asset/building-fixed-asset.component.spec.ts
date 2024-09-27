import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingFixedAssetComponent } from './building-fixed-asset.component';

describe('BuildingFixedAssetComponent', () => {
  let component: BuildingFixedAssetComponent;
  let fixture: ComponentFixture<BuildingFixedAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingFixedAssetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingFixedAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
