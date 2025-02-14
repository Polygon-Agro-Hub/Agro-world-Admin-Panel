import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageApplicationsComponent } from './manage-applications.component';

describe('ManageApplicationsComponent', () => {
  let component: ManageApplicationsComponent;
  let fixture: ComponentFixture<ManageApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageApplicationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
