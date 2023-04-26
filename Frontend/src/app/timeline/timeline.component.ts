import { Component, OnInit } from '@angular/core';
import { Story } from '../story';
import { TimelineService } from '../timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.sass']
})
export class TimelineComponent implements OnInit {
  stories: Story[] = [];

  constructor(private timelineService: TimelineService) { }

  ngOnInit(): void {
    this.getTimeline();
  }

  getTimeline(): void {
    this.timelineService.getTimeline()
      .subscribe(stories => this.stories = stories);
  }
}
