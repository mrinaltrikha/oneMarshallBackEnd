import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeptionItemsComponent } from './redeption-items.component';

describe('RedeptionItemsComponent', () => {
  let component: RedeptionItemsComponent;
  let fixture: ComponentFixture<RedeptionItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedeptionItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeptionItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
