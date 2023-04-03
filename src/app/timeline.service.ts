import { Injectable } from '@angular/core';
import { Story } from './story';
import { STORIES } from './mock-stories';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  constructor() { }

  // private heroesUrl = 'api/heroes';  // URL to web api
  // httpOptions = {
  //   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  // };

  // /** GET heroes from the server */
  // getHeroes(): Observable<Hero[]> {
  //   return this.http.get<Hero[]>(this.heroesUrl)
  //     .pipe(
  //       tap(_ => this.log('fetched heroes')),
  //       catchError(this.handleError<Hero[]>('getHeroes', []))
  //     );
  // }

  getTimeline(): Observable<Story[]> {
    const stories = of(STORIES);
    return stories;
  }
}
