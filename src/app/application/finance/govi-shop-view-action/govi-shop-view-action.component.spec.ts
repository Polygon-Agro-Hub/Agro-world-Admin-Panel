import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopViewActionComponent } from './govi-shop-view-action.component';

describe('GoviShopViewActionComponent', () => {
  let component: GoviShopViewActionComponent;
  let fixture: ComponentFixture<GoviShopViewActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopViewActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopViewActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
