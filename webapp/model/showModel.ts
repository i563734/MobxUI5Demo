import { observable } from "mobx";
import { apiGet } from "mobxui5demo/misc/config";

interface ShowView {
    image: string,
    title: string,
    summary: string
}

interface ShowResponse {
    score: number,
    show: {
        id : number,
        image : {
            medium : string,
            original : string
        }
        name : string,
        summary : string
    }
} 


export interface ShowModel {
    searchText: string,
    shows: ShowResponse[]
    search:()=>void;
}

export default function createShowModel () {
    var shows:ShowResponse[] = [];
    var show:ShowModel = observable({
        searchText:"",
        shows,
        get showView(){
            var showView:ShowView[] = [];
            for(const s of this.shows){
                showView.push({
                    image:s.show && s.show.image && s.show.image.original ? s.show.image.original : "../images/not-found.png",
                    title:s.show.name,
                    summary:s.show.summary
                });
            }
            return showView;
        },
        search: async function(){
            var showList = await apiGet<ShowResponse[]>(`search/shows?q=${this.searchText}`).then().catch(()=>{                
            });
            this.shows = [];
            if(showList && showList.length){
                for(const s of showList){
                    this.shows.push(s);
                }
            }
        }
    }
);
    return show;
}