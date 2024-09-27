import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPlantcareUsersComponent } from './view-plantcare-users.component';

describe('ViewPlantcareUsersComponent', () => {
  let component: ViewPlantcareUsersComponent;
  let fixture: ComponentFixture<ViewPlantcareUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPlantcareUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPlantcareUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
