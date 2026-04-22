import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGoviShopComponent } from './update-govi-shop.component';

describe('UpdateGoviShopComponent', () => {
  let component: UpdateGoviShopComponent;
  let fixture: ComponentFixture<UpdateGoviShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateGoviShopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateGoviShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
