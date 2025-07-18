import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHeadPortalComponent } from './view-head-portal.component';

describe('ViewHeadPortalComponent', () => {
  let component: ViewHeadPortalComponent;
  let fixture: ComponentFixture<ViewHeadPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHeadPortalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewHeadPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
