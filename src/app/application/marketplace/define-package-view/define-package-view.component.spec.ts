import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinePackageViewComponent } from './define-package-view.component';

describe('DefinePackageViewComponent', () => {
  let component: DefinePackageViewComponent;
  let fixture: ComponentFixture<DefinePackageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefinePackageViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefinePackageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
