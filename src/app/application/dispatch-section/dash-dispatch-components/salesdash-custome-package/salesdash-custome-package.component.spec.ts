import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesdashCustomePackageComponent } from './salesdash-custome-package.component';

describe('SalesdashCustomePackageComponent', () => {
  let component: SalesdashCustomePackageComponent;
  let fixture: ComponentFixture<SalesdashCustomePackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesdashCustomePackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesdashCustomePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
