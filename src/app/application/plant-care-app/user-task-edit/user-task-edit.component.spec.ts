import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTaskEditComponent } from './user-task-edit.component';

describe('UserTaskEditComponent', () => {
  let component: UserTaskEditComponent;
  let fixture: ComponentFixture<UserTaskEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTaskEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserTaskEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
