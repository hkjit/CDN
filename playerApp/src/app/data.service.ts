import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  private REST_API_SERVER = "http://localhost:3000";
  constructor(private httpClient: HttpClient) {

  }
  public getPlaylist(){
    return this.httpClient.get(this.REST_API_SERVER+'/fetchPlaylist');
  }
  public getLink(resource:any){
    return this.httpClient.get(this.REST_API_SERVER+'/fetch?title='+resource);
  }
}
