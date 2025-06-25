import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAdditionalItemsComponent } from './custom-additional-items.component';

describe('CustomAdditionalItemsComponent', () => {
  let component: CustomAdditionalItemsComponent;
  let fixture: ComponentFixture<CustomAdditionalItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAdditionalItemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomAdditionalItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
