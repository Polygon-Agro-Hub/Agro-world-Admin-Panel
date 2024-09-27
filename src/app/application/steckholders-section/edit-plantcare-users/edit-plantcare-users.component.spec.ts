import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlantcareUsersComponent } from './edit-plantcare-users.component';

describe('EditPlantcareUsersComponent', () => {
  let component: EditPlantcareUsersComponent;
  let fixture: ComponentFixture<EditPlantcareUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPlantcareUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPlantcareUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
