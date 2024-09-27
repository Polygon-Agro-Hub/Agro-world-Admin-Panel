import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCropCalenderComponent } from './create-crop-calender.component';

describe('CreateCropCalenderComponent', () => {
  let component: CreateCropCalenderComponent;
  let fixture: ComponentFixture<CreateCropCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCropCalenderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCropCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
