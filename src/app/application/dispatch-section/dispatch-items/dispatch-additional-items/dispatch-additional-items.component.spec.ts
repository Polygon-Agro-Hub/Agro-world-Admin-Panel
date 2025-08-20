import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchAdditionalItemsComponent } from './dispatch-additional-items.component';

describe('DispatchAdditionalItemsComponent', () => {
  let component: DispatchAdditionalItemsComponent;
  let fixture: ComponentFixture<DispatchAdditionalItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispatchAdditionalItemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DispatchAdditionalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
