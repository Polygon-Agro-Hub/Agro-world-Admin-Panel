import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopViewDocumentComponent } from './govi-shop-view-document.component';

describe('GoviShopViewDocumentComponent', () => {
  let component: GoviShopViewDocumentComponent;
  let fixture: ComponentFixture<GoviShopViewDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopViewDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopViewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
