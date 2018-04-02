import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { time, select, scale, svg, extent, max } from 'd3';
import { rawData } from './data';
export interface RowData {
  date: Date;
  value: number;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  public xMargin = 30;
  public yMargin = 20;
  public svgWidth = 400;
  public svgHeight = 100;
  public data : RowData;

  public lastPrice = 800;

  constructor(private viewRef: ViewContainerRef) {
    // const parseDate = time.format('%Y-%m-%d %H:%M:%S');
    // const parseDate = time.format('%b-%Y');
    rawData.forEach(function(d) {
      d.date = new Date(d.date);
      d.value = +d.value;
      // console.log(d);
    });
    this.data = rawData;
  }

  ngOnInit() {
    this.initLine();
  }

  // initArea() {
  //   const el = this.viewRef.element.nativeElement.querySelector('div');
  //   const x = scale.linear().range([0, this.svgWidth]);
  //   const y = scale.linear().range([this.svgHeight, 0]);
  // }

  initLine() {
    const el = this.viewRef.element.nativeElement.querySelector('div');
    // console.log(el);

    const _maxX = max(this.data, d => d.date);
    const _maxY =  extent(this.data, d => {
      return d.value;
    });

    const x = scale
      .linear()
      .domain(
        extent(this.data, d => {
          return d.date;
        })
      )
      .range([0, this.svgWidth]);

    const y = scale
      .linear()
      .domain(
        extent(this.data, d => {
          return d.value;
        })
      )
      .range([this.svgHeight, 0]);

    console.log(x(_maxX));
    // console.log(_maxY[1]);
    // console.log(y(971));

    // x.domain(
    //   extent(this.data, d => {
    //     return d.date;
    //   })
    // );
    // y.domain(
    //   extent(this.data, d => {
    //     return d.value;
    //   })
    // );

    // Line Chart
    const _line = svg
      .line<RowData>()
      .interpolate('basis')
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.value);
      });

    // Area Chart
    const _area = svg
      .area<RowData>()
      .interpolate('basis')
      .x(function(d) {
        return x(d.date);
      })
      .y0(this.svgHeight)
      .y1(function(d) {
        return y(d.value);
      });

    // Area Chart Bottom
    const _areaBottom = svg
      .area<RowData>()
      .interpolate('basis')
      .x(function(d) {
        return x(d.date);
      })
      .y0(0)
      .y1(function(d) {
        return y(d.value);
      });

    const _svg = select(el)
      .append('svg:svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g');
    // .attr('transform', 'translate(10, 10)');

    // ClipPath 생성
    this.createClipPath(_svg, this.svgWidth, y(this.lastPrice) + 22);
    this.createClipPathBottom(
      _svg,
      this.svgWidth,
      this.svgHeight,
      y(this.lastPrice) + 22
    );

    // RED 라인 , Area
    _svg
      .append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#bbb')
      .attr('stroke-width', 1)
      .attr('clip-path', 'url(#top-area)')
      .attr('d', _line);

    _svg
      .append('path')
      .datum(this.data)
      .attr('fill', 'red')
      .attr('class', 'area')
      .attr('clip-path', 'url(#top-area)')
      .attr('d', _area);

    _svg
      .append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 1)
      .attr('clip-path', 'url(#bottom-area)')
      .attr('d', _line);

    _svg
      .append('path')
      .datum(this.data)
      .attr('fill', 'blue')
      .attr('class', 'area')
      .attr('clip-path', 'url(#bottom-area)')
      .attr('d', _areaBottom);
  }

  public createClipPath(svgEl, width, height) {
    return svgEl
      .append('clipPath')
      .attr('id', 'top-area')
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 0)
      .attr('ry', 0);
  }

  public createClipPathBottom(svgEl, width, height, yheight) {
    return svgEl
      .append('clipPath')
      .attr('id', 'bottom-area')
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', yheight)
      .attr('rx', 0)
      .attr('ry', 0);
  }
}
