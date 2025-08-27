import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCitiesComponent } from './assign-cities.component';

describe('AssignCitiesComponent', () => {
  let component: AssignCitiesComponent;
  let fixture: ComponentFixture<AssignCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
