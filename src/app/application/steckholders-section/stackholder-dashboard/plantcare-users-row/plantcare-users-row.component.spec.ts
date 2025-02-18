import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantcareUsersRowComponent } from './plantcare-users-row.component';

describe('PlantcareUsersRowComponent', () => {
  let component: PlantcareUsersRowComponent;
  let fixture: ComponentFixture<PlantcareUsersRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantcareUsersRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlantcareUsersRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
