import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVarietyComponent } from './view-variety.component';

describe('ViewVarietyComponent', () => {
  let component: ViewVarietyComponent;
  let fixture: ComponentFixture<ViewVarietyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewVarietyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewVarietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
