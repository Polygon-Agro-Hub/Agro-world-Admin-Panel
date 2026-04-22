import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGoviShopUserComponent } from './update-govi-shop-user.component';

describe('UpdateGoviShopUserComponent', () => {
  let component: UpdateGoviShopUserComponent;
  let fixture: ComponentFixture<UpdateGoviShopUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateGoviShopUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateGoviShopUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
