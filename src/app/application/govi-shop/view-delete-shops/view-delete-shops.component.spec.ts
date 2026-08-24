import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeleteShopsComponent } from './view-delete-shops.component';

describe('ViewDeleteShopsComponent', () => {
  let component: ViewDeleteShopsComponent;
  let fixture: ComponentFixture<ViewDeleteShopsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeleteShopsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDeleteShopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
