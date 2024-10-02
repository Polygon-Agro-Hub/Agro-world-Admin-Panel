import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewCropCalanderTaskComponent } from './add-new-crop-calander-task.component';

describe('AddNewCropCalanderTaskComponent', () => {
  let component: AddNewCropCalanderTaskComponent;
  let fixture: ComponentFixture<AddNewCropCalanderTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewCropCalanderTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewCropCalanderTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
