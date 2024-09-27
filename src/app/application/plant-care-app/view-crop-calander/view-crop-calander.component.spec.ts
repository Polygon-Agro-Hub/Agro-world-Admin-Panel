import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropCalanderComponent } from './view-crop-calander.component';

describe('ViewCropCalanderComponent', () => {
  let component: ViewCropCalanderComponent;
  let fixture: ComponentFixture<ViewCropCalanderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropCalanderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropCalanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
