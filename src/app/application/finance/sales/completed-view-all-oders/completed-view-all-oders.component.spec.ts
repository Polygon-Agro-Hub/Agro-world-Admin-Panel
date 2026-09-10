import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedViewAllOdersComponent } from './completed-view-all-oders.component';

describe('CompletedViewAllOdersComponent', () => {
  let component: CompletedViewAllOdersComponent;
  let fixture: ComponentFixture<CompletedViewAllOdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedViewAllOdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompletedViewAllOdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
