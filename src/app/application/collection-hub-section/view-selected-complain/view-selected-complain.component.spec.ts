import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSelectedComplainComponent } from './view-selected-complain.component';

describe('ViewSelectedComplainComponent', () => {
  let component: ViewSelectedComplainComponent;
  let fixture: ComponentFixture<ViewSelectedComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSelectedComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSelectedComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
