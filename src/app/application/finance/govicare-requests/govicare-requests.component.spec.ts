import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareRequestsComponent } from './govicare-requests.component';

describe('GovicareRequestsComponent', () => {
  let component: GovicareRequestsComponent;
  let fixture: ComponentFixture<GovicareRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
