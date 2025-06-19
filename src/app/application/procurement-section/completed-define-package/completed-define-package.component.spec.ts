import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedDefinePackageComponent } from './completed-define-package.component';

describe('CompletedDefinePackageComponent', () => {
  let component: CompletedDefinePackageComponent;
  let fixture: ComponentFixture<CompletedDefinePackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedDefinePackageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompletedDefinePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
