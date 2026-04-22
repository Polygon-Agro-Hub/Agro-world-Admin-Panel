import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovishopUsersComponent } from './govishop-users.component';

describe('GovishopUsersComponent', () => {
  let component: GovishopUsersComponent;
  let fixture: ComponentFixture<GovishopUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovishopUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovishopUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
