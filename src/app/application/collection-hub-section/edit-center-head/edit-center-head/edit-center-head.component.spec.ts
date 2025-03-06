import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterHeadComponent } from './edit-center-head.component';

describe('EditCenterHeadComponent', () => {
  let component: EditCenterHeadComponent;
  let fixture: ComponentFixture<EditCenterHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCenterHeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCenterHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
