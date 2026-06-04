import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropVarietyComponent } from './view-crop-variety.component';

describe('ViewCropVarietyComponent', () => {
  let component: ViewCropVarietyComponent;
  let fixture: ComponentFixture<ViewCropVarietyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropVarietyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropVarietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
