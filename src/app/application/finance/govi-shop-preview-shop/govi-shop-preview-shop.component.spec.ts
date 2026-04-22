import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopPreviewShopComponent } from './govi-shop-preview-shop.component';

describe('GoviShopPreviewShopComponent', () => {
  let component: GoviShopPreviewShopComponent;
  let fixture: ComponentFixture<GoviShopPreviewShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopPreviewShopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopPreviewShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
