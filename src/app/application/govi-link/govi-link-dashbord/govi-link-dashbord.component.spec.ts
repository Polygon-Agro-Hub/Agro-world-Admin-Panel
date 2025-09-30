import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviLinkDashbordComponent } from './govi-link-dashbord.component';

describe('GoviLinkDashbordComponent', () => {
  let component: GoviLinkDashbordComponent;
  let fixture: ComponentFixture<GoviLinkDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviLinkDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviLinkDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
