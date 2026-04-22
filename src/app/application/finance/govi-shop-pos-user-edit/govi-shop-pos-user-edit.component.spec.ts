import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviShopPosUserEditComponent } from './govi-shop-pos-user-edit.component';

describe('GoviShopPosUserEditComponent', () => {
  let component: GoviShopPosUserEditComponent;
  let fixture: ComponentFixture<GoviShopPosUserEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviShopPosUserEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviShopPosUserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
