import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDriverComponent } from './view-driver.component';

describe('ViewDriverComponent', () => {
  let component: ViewDriverComponent;
  let fixture: ComponentFixture<ViewDriverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDriverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
