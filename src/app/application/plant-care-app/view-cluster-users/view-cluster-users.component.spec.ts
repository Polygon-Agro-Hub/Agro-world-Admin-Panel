import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClusterUsersComponent } from './view-cluster-users.component';

describe('ViewClusterUsersComponent', () => {
  let component: ViewClusterUsersComponent;
  let fixture: ComponentFixture<ViewClusterUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewClusterUsersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewClusterUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
