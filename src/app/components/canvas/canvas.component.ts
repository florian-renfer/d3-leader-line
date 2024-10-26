import { DialogModule, Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { SettingsComponent } from '../settings/settings.component';

declare let LeaderLine: any;

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('sidebar', { static: true })
  private sidebar!: ElementRef<HTMLDivElement>;

  @ViewChild('wrapper', { static: true })
  private wrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('view', { static: true })
  private view!: ElementRef<HTMLDivElement>;

  @ViewChild('start', { static: true })
  private start!: ElementRef<HTMLDivElement>;

  @ViewChild('end', { static: true })
  private end!: ElementRef<HTMLDivElement>;

  @ViewChild('additional', { static: true })
  private additional!: ElementRef<HTMLDivElement>;

  @ViewChild('connectionWrapper', { static: true })
  private connectionWrapper!: ElementRef<HTMLDivElement>;

  private zoomExtent: [number, number] = [0.5, 5];
  protected zoomTransform: d3.ZoomTransform | undefined;

  private zoomBehavior: d3.ZoomBehavior<HTMLDivElement, unknown> = d3
    .zoom<HTMLDivElement, unknown>()
    .scaleExtent(this.zoomExtent)
    .on('zoom', (event) => this.onZoom(event));

  private dragBehavior: d3.DragBehavior<HTMLDivElement, unknown, unknown> = d3
    .drag<HTMLDivElement, unknown, unknown>()
    .on('start', (event: any) => this.onStartDragging(event))
    .on('drag', (event: any) => this.onDragging(event));

  private leaderLines: any[] = [];

  private currentlyDragged?: HTMLDivElement;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(
    private readonly renderer: Renderer2,
    private readonly dialogService: Dialog,
  ) {}

  private dialogConfig = {
    width: '30vw',
    height: '20vh',
  };

  ngAfterViewInit(): void {
    this.setupD3();
    this.createConnection();

    this.initialMovement();
  }

  protected openDialog(): void {
    this.dialogService.open(SettingsComponent, this.dialogConfig);
  }

  private setupD3(): void {
    // Pan & zoom
    d3.select(this.wrapper.nativeElement).call(this.zoomBehavior);

    // Drag & drop
    d3.select(this.start.nativeElement).call(this.dragBehavior);
    d3.select(this.end.nativeElement).call(this.dragBehavior);
    d3.select(this.additional.nativeElement).call(this.dragBehavior);
  }

  private onZoom({ transform }: d3.D3ZoomEvent<HTMLDivElement, unknown>): void {
    this.zoomTransform = transform;

    // Pan
    d3.select(this.view.nativeElement).style(
      'translate',
      `${transform.x}px ${transform.y}px`,
    );

    // Zoom
    d3.select(this.view.nativeElement).style('scale', `${transform.k}`);

    this.position();
  }

  private createConnection(): void {
    const leaderLine = new LeaderLine(
      this.start.nativeElement,
      this.end.nativeElement,
      {
        color: '#9ca6b2',
        startPlug: 'disc',
        endPlug: 'arrow3',
        size: 3,
      },
    );

    this.leaderLines.push(leaderLine);
    this.moveConnectionsToWrapper();
  }

  private moveConnectionsToWrapper(): void {
    const leaderLineDefs = document.querySelector('body > #leader-line-defs');
    if (leaderLineDefs) {
      this.renderer.appendChild(
        this.connectionWrapper.nativeElement,
        leaderLineDefs,
      );
    }

    const leaderLineElem = document.querySelector(
      'body > .leader-line:last-child',
    );
    if (leaderLineElem) {
      this.renderer.appendChild(
        this.connectionWrapper.nativeElement,
        leaderLineElem,
      );
    }

    this.position();
  }

  private position(): void {
    for (const leaderLine of this.leaderLines) {
      leaderLine.position();
    }

    const sidebarRect = this.sidebar.nativeElement.getBoundingClientRect();
    const offset: [number, number] = [sidebarRect.width, 0];

    // Remove sidebar offset
    d3.select(this.connectionWrapper.nativeElement).style(
      'translate',
      `${offset[0] * -1}px ${offset[1] * -1}px`,
    );
  }

  private onStartDragging(
    event: d3.D3DragEvent<HTMLElement, unknown, unknown>,
  ): void {
    this.currentlyDragged = event.sourceEvent.target;

    this.offsetX =
      event.sourceEvent.clientX -
      this.currentlyDragged!.getBoundingClientRect().left;

    this.offsetY =
      event.sourceEvent.clientY -
      this.currentlyDragged!.getBoundingClientRect().top;
  }

  private onDragging(
    event: d3.D3DragEvent<HTMLElement, unknown, unknown>,
  ): void {
    if (this.currentlyDragged) {
      const currentTransform = d3.zoomTransform(this.view.nativeElement);

      const dragX = (event.x - this.offsetX) / currentTransform.k;
      const dragY = (event.y - this.offsetY) / currentTransform.k;

      const offset: [number, number] = [dragX, dragY];

      d3.select(this.currentlyDragged).style(
        'translate',
        `${offset[0]}px ${offset[1]}px`,
      );

      this.position();
    }
  }

  private initialMovement(): void {
    d3.select(this.start.nativeElement).style('translate', '50px 100px');
    d3.select(this.end.nativeElement).style('translate', '600px 800px');
    this.position();
  }
}
