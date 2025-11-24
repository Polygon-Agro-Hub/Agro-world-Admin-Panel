import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllGovicareRequestsComponent } from './view-all-govicare-requests.component';

describe('ViewAllGovicareRequestsComponent', () => {
  let component: ViewAllGovicareRequestsComponent;
  let fixture: ComponentFixture<ViewAllGovicareRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllGovicareRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllGovicareRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
