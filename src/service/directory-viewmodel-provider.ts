import { HttpClient } from '@angular/common/http';
import { DirectoryViewModel } from './../models/directory-viewmodel';
import { Injectable } from '@angular/core';

@Injectable()
export class DirectoryViewModelProvider {

  constructor(
    private http: HttpClient
  ) {  }

  public async get(): Promise<DirectoryViewModel> {
    const vm = await this.http.get<DirectoryViewModel>('/assets/static.json').toPromise();
    return vm;
  }
}
