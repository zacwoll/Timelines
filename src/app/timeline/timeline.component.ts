import { Component, OnInit } from '@angular/core';
import { Story } from '../story';
import { Stories } from '../mock-stories';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.sass']
})
export class TimelineComponent implements OnInit {
  stories: Story[] = Stories;

  ngOnInit(): void {
    this.getTimeline();
  }

  getTimeline(): void {
    
  }
}
