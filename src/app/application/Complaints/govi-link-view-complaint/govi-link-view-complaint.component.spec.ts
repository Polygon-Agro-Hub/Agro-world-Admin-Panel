import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviLinkViewComplaintComponent } from './govi-link-view-complaint.component';

describe('GoviLinkViewComplaintComponent', () => {
  let component: GoviLinkViewComplaintComponent;
  let fixture: ComponentFixture<GoviLinkViewComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviLinkViewComplaintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviLinkViewComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
