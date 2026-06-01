import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropGroupDetailsComponent } from './view-crop-group-details.component';

describe('ViewCropGroupDetailsComponent', () => {
  let component: ViewCropGroupDetailsComponent;
  let fixture: ComponentFixture<ViewCropGroupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropGroupDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
