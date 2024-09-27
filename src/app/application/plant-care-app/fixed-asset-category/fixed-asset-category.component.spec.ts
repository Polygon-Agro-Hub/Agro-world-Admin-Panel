import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedAssetCategoryComponent } from './fixed-asset-category.component';

describe('FixedAssetCategoryComponent', () => {
  let component: FixedAssetCategoryComponent;
  let fixture: ComponentFixture<FixedAssetCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedAssetCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedAssetCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
