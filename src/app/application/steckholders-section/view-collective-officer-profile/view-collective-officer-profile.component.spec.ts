import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCollectiveOfficerProfileComponent } from './view-collective-officer-profile.component';

describe('ViewCollectiveOfficerProfileComponent', () => {
  let component: ViewCollectiveOfficerProfileComponent;
  let fixture: ComponentFixture<ViewCollectiveOfficerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCollectiveOfficerProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCollectiveOfficerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
