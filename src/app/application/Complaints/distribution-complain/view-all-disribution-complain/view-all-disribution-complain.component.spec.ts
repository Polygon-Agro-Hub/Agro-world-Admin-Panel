import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllDisributionComplainComponent } from './view-all-disribution-complain.component';

describe('ViewAllDisributionComplainComponent', () => {
  let component: ViewAllDisributionComplainComponent;
  let fixture: ComponentFixture<ViewAllDisributionComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllDisributionComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllDisributionComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
