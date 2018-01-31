import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';

import { DirectoryViewModelProvider } from '../service/directory-viewmodel-provider';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { TreeMapComponent } from './tree-map/tree-map.component';
import { TreeViewComponent } from './tree-view/tree-view.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeMapComponent,
    TreeViewComponent
  ],
  imports: [
    BrowserModule,
    AngularSplitModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule
  ],
  providers: [
    DirectoryViewModelProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
