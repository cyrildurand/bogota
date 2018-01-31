import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

import { DirectoryViewModelProvider } from '../../service/directory-viewmodel-provider';
import { DirectoryViewModel } from './../../models/directory-viewmodel';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'id', 'size'];
  dataSource: MatTableDataSource<DirectoryViewModel>;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private directoryViewModelProvider: DirectoryViewModelProvider) {
  }

  public async ngOnInit() {
  }

  public async ngAfterViewInit() {
    const vm = await this.directoryViewModelProvider.get();
    this.dataSource = new MatTableDataSource<DirectoryViewModel>(vm.children);
    this.dataSource.sort = this.sort;
  }
}
