import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropGroupComponent } from './view-crop-group.component';

describe('ViewCropGroupComponent', () => {
  let component: ViewCropGroupComponent;
  let fixture: ComponentFixture<ViewCropGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
