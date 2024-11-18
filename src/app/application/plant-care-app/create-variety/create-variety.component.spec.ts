import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVarietyComponent } from './create-variety.component';

describe('CreateVarietyComponent', () => {
  let component: CreateVarietyComponent;
  let fixture: ComponentFixture<CreateVarietyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVarietyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateVarietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
