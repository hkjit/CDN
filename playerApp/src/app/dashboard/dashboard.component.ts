import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  resources = [];
  currentPlaying="";
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getPlaylist().subscribe((data: any[])=>{
      
      this.resources = data['items'];
      console.log(this.resources);
    })  
  }

  fetchResource(name:any){
    console.log(name);
    this.dataService.getLink(name).subscribe((data: any[])=>{
      this.currentPlaying=data['url'];
      console.log(this.currentPlaying);

    })  
  }

}
