import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchMarketplaceComponent } from './dispatch-marketplace.component';

describe('DispatchMarketplaceComponent', () => {
  let component: DispatchMarketplaceComponent;
  let fixture: ComponentFixture<DispatchMarketplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispatchMarketplaceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DispatchMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
