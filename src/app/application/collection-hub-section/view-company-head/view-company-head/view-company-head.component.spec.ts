import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCompanyHeadComponent } from './view-company-head.component';

describe('ViewCompanyHeadComponent', () => {
  let component: ViewCompanyHeadComponent;
  let fixture: ComponentFixture<ViewCompanyHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCompanyHeadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewCompanyHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
