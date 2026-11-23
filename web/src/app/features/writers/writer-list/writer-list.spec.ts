import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WritersModule } from '../writers-module';
import { WriterList } from './writer-list';

const API = 'http://localhost:8000/api/v1';

const writer = (id: number, name: string, following: boolean, book_count = 1) => ({
  id, name, bio: `${name} writes books.`, image_url: '', book_count, following,
});

const reply = (data: unknown) => ({ success: true, message: '', data });

describe('WriterList', () => {
  let fixture: ComponentFixture<WriterList>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('bookstore.token', 'abc');
    await TestBed.configureTestingModule({
      imports: [WritersModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WriterList);
    fixture.detectChanges();
    http.expectOne(`${API}/writers`).flush(
      reply([writer(1, 'Arjun Patel', true), writer(2, 'Raj Patel', false), writer(7, 'James Adams', true, 2)]),
    );
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('splits writers into My Writers and Discover', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.myWriters().map((w) => w.name)).toEqual(['Arjun Patel', 'James Adams']);
    expect(fixture.componentInstance.otherWriters().map((w) => w.name)).toEqual(['Raj Patel']);
    expect(el.querySelectorAll('article').length).toBe(3);
    expect(el.textContent).toContain('Your writers (2)');
    expect(el.textContent).toContain('Discover more writers');
    expect(el.textContent).toContain('2 books');
  });

  it('follows a writer and moves them to My Writers', () => {
    fixture.componentInstance.toggleFollow(fixture.componentInstance.otherWriters()[0]);
    http.expectOne({ method: 'POST', url: `${API}/writers/2/follow` }).flush(reply(writer(2, 'Raj Patel', true)));
    fixture.detectChanges();

    expect(fixture.componentInstance.myWriters().length).toBe(3);
    expect(fixture.componentInstance.otherWriters().length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Raj Patel added to My Writers');
  });

  it('removes a followed writer', () => {
    fixture.componentInstance.toggleFollow(fixture.componentInstance.myWriters()[0]);
    http.expectOne({ method: 'DELETE', url: `${API}/writers/1/follow` }).flush(reply(writer(1, 'Arjun Patel', false)));
    fixture.detectChanges();

    expect(fixture.componentInstance.myWriters().map((w) => w.id)).toEqual([7]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Arjun Patel removed from My Writers');
  });
});
