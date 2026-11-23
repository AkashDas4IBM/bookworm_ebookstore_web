import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../shared-module';

import { FilterAndSearchToolbar } from './filter-and-search-toolbar';

describe('FilterAndSearchToolbar', () => {
  let component: FilterAndSearchToolbar;
  let fixture: ComponentFixture<FilterAndSearchToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterAndSearchToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
