import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCollectiveOfficerComponent } from './view-collective-officer.component';

describe('ViewCollectiveOfficerComponent', () => {
  let component: ViewCollectiveOfficerComponent;
  let fixture: ComponentFixture<ViewCollectiveOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCollectiveOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCollectiveOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
