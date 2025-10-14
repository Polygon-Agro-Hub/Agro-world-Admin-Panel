import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicarePackagesFirstRowComponent } from './govicare-packages-first-row.component';

describe('GovicarePackagesFirstRowComponent', () => {
  let component: GovicarePackagesFirstRowComponent;
  let fixture: ComponentFixture<GovicarePackagesFirstRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicarePackagesFirstRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicarePackagesFirstRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
