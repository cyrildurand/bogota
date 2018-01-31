import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { BaseType, HierarchyRectangularNode, ScaleOrdinal, Selection, TreemapLayout } from 'd3';

import { DirectoryViewModel } from './../../models/directory-viewmodel';
import { DirectoryViewModelProvider } from './../../service/directory-viewmodel-provider';

@Component({
  selector: 'app-tree-map',
  templateUrl: './tree-map.component.html',
  styleUrls: ['./tree-map.component.css']
})
export class TreeMapComponent implements AfterViewInit, OnInit {

  private readonly _animationSpeed = 500;

  private _layout: TreemapLayout<DirectoryViewModel>;
  private _colors: ScaleOrdinal<string, string>;

  /* current SVG element where the rendering is processed */
  private _currentElement: Selection<BaseType, HierarchyRectangularNode<DirectoryViewModel>, BaseType, HierarchyRectangularNode<DirectoryViewModel>>;


  // TODO : remove theses properties when using route
  /* used only to get position for resize event */
  private _currentData: DirectoryViewModel;

  constructor(
    private element: ElementRef,
    private http: HttpClient,
    private directoryViewModelProvider: DirectoryViewModelProvider) {
  }

  public ngOnInit() {
    this._layout = d3.treemap<DirectoryViewModel>()
      .paddingInner(2);
    this._colors = d3.scaleOrdinal(d3.schemeCategory20);
  }

  public async ngAfterViewInit() {
    const data = await this.directoryViewModelProvider.get();
    const rootNode = d3.select<BaseType, HierarchyRectangularNode<DirectoryViewModel>>(this.element.nativeElement)
      .children() // svg
      .children() // g(#root)
      .filter('g');

    this.render(data, rootNode, this.renderBox);
  }

  public resize() {
    this.render(this._currentData, this._currentElement, this.renderBox);
  }

  private render(
    /* directory data to render */
    currentData: DirectoryViewModel,
    /* targetElement where to render the data */
    targetElement: Selection<BaseType, HierarchyRectangularNode<DirectoryViewModel>, BaseType, HierarchyRectangularNode<DirectoryViewModel>>,
    /* coordinate and size of the box where to render the data */
    targetBox: { x: number, y: number, width: number, height: number },
    animate: boolean = false
  ): Selection<BaseType, HierarchyRectangularNode<DirectoryViewModel>, BaseType, HierarchyRectangularNode<DirectoryViewModel>> {

    // build the hierarchy based on the current data
    const hierarchy = d3.hierarchy(currentData)
      .sum(d => d.size)
      // TODO : move this to the data source
      .eachBefore(d => d.data.id = d.data.id || (targetElement.attr('id') + '.' + d.data.name));

    // position and resize the target element (the container) to fit the box
    targetElement
      .transition()
      .duration(animate ? this._animationSpeed : 0)
      .attr('transform', d => `translate(${targetBox.x}, ${targetBox.y})`)
      .select('rect')
      .attr('width', d => targetBox.width)
      .attr('height', d => targetBox.height);

    // compute the new HierarchyRectangularNode for this data and target box
    this._layout.size([targetBox.width, targetBox.height]);
    const rootNode = this._layout(hierarchy);

    // update child cells based on data
    let cells = targetElement
      .children()
      .filter('g')
      .data(rootNode.children);

    const newCells = cells.enter()
      .append('g')
      .attr('id', d => d.data.id)
      .call(c => c
        .append('rect')
      )
      .call(c => c
        .append('text')
        .attr('y', 15)
        .text(d => `${d.data.name} (${(d.data.children || []).length})`)
      );
    cells.exit()
      .remove();
    cells = cells.merge(newCells);

    // position and resize each cell to the computed size & position
    cells
      .transition()
      .duration(animate ? this._animationSpeed : 0)
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
      .style('opacity', 1)
      .select('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style('fill', d => this._colors(d.data.name));

    cells
      .on('click', datum => this.down(datum));

    this._currentElement = targetElement;

    // used only by the resize method
    // TODO : remove this with route implementation
    this._currentData = currentData;

    return cells;
  }

  private down(datum: HierarchyRectangularNode<DirectoryViewModel>) {
    d3.event.stopPropagation();

    if (!datum.data.children) {
      return;
    }

    const cells = this._currentElement.children().filter('g');

    // remove all obsolete click handler
    cells.on('click', null);

    // move other node away
    cells
      .filter(d => d !== datum)
      .transition()
      .duration(this._animationSpeed)
      .style('opacity', 0)
      .attr('transform', d => {
        // decide if this block should go left right or stay
        let x = 0, y = 0;
        if (d.x1 < datum.x0) {
          x = d.x0 - d.x1;
        } else if (d.x0 > datum.x1) {
          x = this.renderBox.width + (d.x0 - datum.x1);
        } else {
          x = d.x0;
        }

        // decide if this block should go up down or stay
        if (d.y1 < datum.y0) {
          y = d.y0 - d.y1;
        } else if (d.y0 > datum.y1) {
          y = this.renderBox.width + (d.y0 - datum.y1);
        } else {
          y = d.y0;
        }

        return `translate(${x}, ${y})`;
      });

    const currentElement = cells.filter(d => d === datum);

    // first render the subnodes on the position and size of the current node
    const initialBox = { x: datum.x0, y: datum.y0, width: datum.x1 - datum.x0, height: datum.y1 - datum.y0 };
    this.render(datum.data, currentElement, initialBox);

    // then render the subnodes in the full render box of this component
    this.render(datum.data, currentElement, this.renderBox, true);

    currentElement.on('contextmenu', d => this.up(d));
  }

  private up(datum: HierarchyRectangularNode<DirectoryViewModel>) {
    d3.event.stopPropagation();
    d3.event.preventDefault();

    // right click will now be handle by parent node
    this._currentElement.on('contextmenu', null);

    // first render the current element in the small final box and hide them
    this.render(datum.data, this._currentElement, { x: 0, y: 0, width: datum.x1 - datum.x0, height: datum.y1 - datum.y0 }, true)
      .transition()
      .duration(this._animationSpeed)
      .delay(this._animationSpeed)
      .style('opacity', 0)
      .remove();

    // render the new element inside the parent of the current element in the full render box
    const parentElement = this._currentElement.parent();
    this.render(datum.parent.data, parentElement, this.renderBox, true);
  }

  private get renderBox(): { x: number, y: number, width: number, height: number } {
    const boundingClientRect = this.element.nativeElement.parentNode.getBoundingClientRect();
    const box = {
      x: 0,
      y: 0,
      width: boundingClientRect.width,
      height: boundingClientRect.height
    };
    return box;
  }
}
