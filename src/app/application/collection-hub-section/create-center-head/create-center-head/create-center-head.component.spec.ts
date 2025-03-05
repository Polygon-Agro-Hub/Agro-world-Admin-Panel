import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCenterHeadComponent } from './create-center-head.component';

describe('CreateCenterHeadComponent', () => {
  let component: CreateCenterHeadComponent;
  let fixture: ComponentFixture<CreateCenterHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCenterHeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCenterHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
