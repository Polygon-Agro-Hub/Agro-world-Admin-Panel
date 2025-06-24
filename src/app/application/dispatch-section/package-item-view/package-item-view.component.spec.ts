import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageItemViewComponent } from './package-item-view.component';

describe('PackageItemViewComponent', () => {
  let component: PackageItemViewComponent;
  let fixture: ComponentFixture<PackageItemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageItemViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackageItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
