import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPackageHistoryComponent } from './view-package-history.component';

describe('ViewPackageHistoryComponent', () => {
  let component: ViewPackageHistoryComponent;
  let fixture: ComponentFixture<ViewPackageHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPackageHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPackageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
