import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoTabComponent } from './personal-info-tab.component';

describe('PersonalInfoTabComponent', () => {
  let component: PersonalInfoTabComponent;
  let fixture: ComponentFixture<PersonalInfoTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
