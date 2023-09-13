import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  countriesUrl: string = environment.luv2shopApiUrl + "/countries";
  statesUrl: string = environment.luv2shopApiUrl + "/states";

  constructor(private httpClient: HttpClient) { }
  getCountries(): Observable<Country[]> {

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }


  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];
    for(let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for(let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }

  

  // // get all states
  // getStates(): Observable<State[]> {
  //   return this.httpClient.get<GetResponseStates>(this.statesUrl).pipe(
  //     map(response => response._embedded.states)
  //   );
  // }

  // get states for a given country code
  getStates(theCountryCode: string): Observable<State[]> {
    const searchUrl: string = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchUrl).pipe(
      map(response => response._embedded.states)
    );
  }
}

export interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

export interface GetResponseStates {
  _embedded: {
    states: State[];
  }
  
}
