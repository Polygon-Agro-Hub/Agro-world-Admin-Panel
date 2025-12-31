import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdProofTabComponent } from './id-proof-tab.component';

describe('IdProofTabComponent', () => {
  let component: IdProofTabComponent;
  let fixture: ComponentFixture<IdProofTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdProofTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IdProofTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
