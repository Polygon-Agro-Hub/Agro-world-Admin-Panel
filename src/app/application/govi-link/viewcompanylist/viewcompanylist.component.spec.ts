import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewcompanylistComponent } from './viewcompanylist.component';

describe('ViewcompanylistComponent', () => {
  let component: ViewcompanylistComponent;
  let fixture: ComponentFixture<ViewcompanylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewcompanylistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewcompanylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
