import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../../shared-module';

import { SortByFilterToolbar } from './sort-by-filter-toolbar';

describe('SortByFilterToolbar', () => {
  let component: SortByFilterToolbar;
  let fixture: ComponentFixture<SortByFilterToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SortByFilterToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
