import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovishopActionComponent } from './govishop-action.component';

describe('GovishopActionComponent', () => {
  let component: GovishopActionComponent;
  let fixture: ComponentFixture<GovishopActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovishopActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovishopActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
