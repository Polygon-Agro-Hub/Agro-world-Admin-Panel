import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterCollectionExpenceComponent } from './center-collection-expence.component';

describe('CenterCollectionExpenceComponent', () => {
  let component: CenterCollectionExpenceComponent;
  let fixture: ComponentFixture<CenterCollectionExpenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterCollectionExpenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterCollectionExpenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
