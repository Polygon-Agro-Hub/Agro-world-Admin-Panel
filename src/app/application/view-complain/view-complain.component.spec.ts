import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComplainComponent } from './view-complain.component';

describe('ViewComplainComponent', () => {
  let component: ViewComplainComponent;
  let fixture: ComponentFixture<ViewComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
