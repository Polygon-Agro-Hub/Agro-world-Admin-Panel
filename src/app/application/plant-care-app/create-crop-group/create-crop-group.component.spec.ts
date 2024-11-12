import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCropGroupComponent } from './create-crop-group.component';

describe('CreateCropGroupComponent', () => {
  let component: CreateCropGroupComponent;
  let fixture: ComponentFixture<CreateCropGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCropGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCropGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
