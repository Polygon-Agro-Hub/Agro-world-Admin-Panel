import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCropTasksComponent } from './view-crop-tasks.component';

describe('ViewCropTasksComponent', () => {
  let component: ViewCropTasksComponent;
  let fixture: ComponentFixture<ViewCropTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCropTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCropTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
