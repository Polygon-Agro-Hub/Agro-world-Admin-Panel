import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandFixedAssetComponent } from './land-fixed-asset.component';

describe('LandFixedAssetComponent', () => {
  let component: LandFixedAssetComponent;
  let fixture: ComponentFixture<LandFixedAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandFixedAssetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandFixedAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
