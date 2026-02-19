import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviLinkJobsServiceRequestResponseComponent } from './govi-link-jobs-service-request-response.component';

describe('GoviLinkJobsServiceRequestResponseComponent', () => {
  let component: GoviLinkJobsServiceRequestResponseComponent;
  let fixture: ComponentFixture<GoviLinkJobsServiceRequestResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviLinkJobsServiceRequestResponseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviLinkJobsServiceRequestResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
