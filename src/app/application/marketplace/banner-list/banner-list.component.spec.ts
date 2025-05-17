import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerListComponent } from './banner-list.component';

describe('BannerListComponent', () => {
  let component: BannerListComponent;
  let fixture: ComponentFixture<BannerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BannerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
