/** @jsx h */
import h from './h.js'

import Rx from 'rxjs'
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

var i = 0;
var tt = [];
const _tocs = new Rx.BehaviorSubject();//.take(5);

//_tocs.subscribe(t => console.log(t))
_tocs.next(tt)
setInterval(()=>{
  if (i<10) { 
    i++;
    tt = tt.concat({title:i+'', description: 'desc'+i});
    _tocs.next(tt)
  } else {
    tt = tt.slice(0, 5);
    i = tt.length;
    _tocs.next(tt);
  }
}, 1000);

 
const abc$ = Observable.of(1)

const _route = Observable.of({ pathname: 'list', params: null }); 

const root = (
<div>
    {_tocs.map(tocs=>tocs.length>0).distinctUntilChanged().combineLatest(Observable.of(gt0=>gt0?(
      <ul>{_tocs.combineLatest(Observable.of(toc => <li data-title={toc.title}>1</li>))}</ul>
    ):<div>jiangui</div>))}
</div>
)



document.body.appendChild(root);
