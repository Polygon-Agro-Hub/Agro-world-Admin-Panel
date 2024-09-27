import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdminMeUserComponent } from './edit-admin-me-user.component';

describe('EditAdminMeUserComponent', () => {
  let component: EditAdminMeUserComponent;
  let fixture: ComponentFixture<EditAdminMeUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAdminMeUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditAdminMeUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
