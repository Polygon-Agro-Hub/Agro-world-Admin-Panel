import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserStaffComponent } from './edit-user-staff.component';

describe('EditUserStaffComponent', () => {
  let component: EditUserStaffComponent;
  let fixture: ComponentFixture<EditUserStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserStaffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditUserStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
