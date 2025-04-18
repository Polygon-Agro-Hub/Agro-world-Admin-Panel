import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPackageListComponent } from './view-package-list.component';

describe('ViewPackageListComponent', () => {
  let component: ViewPackageListComponent;
  let fixture: ComponentFixture<ViewPackageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPackageListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPackageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
