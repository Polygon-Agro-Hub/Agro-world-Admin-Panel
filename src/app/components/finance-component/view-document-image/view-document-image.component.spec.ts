import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDocumentImageComponent } from './view-document-image.component';

describe('ViewDocumentImageComponent', () => {
  let component: ViewDocumentImageComponent;
  let fixture: ComponentFixture<ViewDocumentImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDocumentImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDocumentImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
