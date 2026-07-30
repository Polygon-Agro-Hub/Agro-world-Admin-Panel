import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortageAssignComponent } from './shortage-assign.component';

describe('ShortageAssignComponent', () => {
  let component: ShortageAssignComponent;
  let fixture: ComponentFixture<ShortageAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortageAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShortageAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
