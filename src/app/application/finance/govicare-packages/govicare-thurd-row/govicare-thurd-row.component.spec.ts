import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareThurdRowComponent } from './govicare-thurd-row.component';

describe('GovicareThurdRowComponent', () => {
  let component: GovicareThurdRowComponent;
  let fixture: ComponentFixture<GovicareThurdRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareThurdRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareThurdRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
