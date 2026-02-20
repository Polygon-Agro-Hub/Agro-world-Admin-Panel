import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGovicapitalUsersComponent } from './view-govicapital-users.component';

describe('ViewGovicapitalUsersComponent', () => {
  let component: ViewGovicapitalUsersComponent;
  let fixture: ComponentFixture<ViewGovicapitalUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGovicapitalUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGovicapitalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
