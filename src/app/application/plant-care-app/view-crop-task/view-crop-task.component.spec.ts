import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropTaskComponent } from './view-crop-task.component';

describe('ViewCropTaskComponent', () => {
  let component: ViewCropTaskComponent;
  let fixture: ComponentFixture<ViewCropTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
