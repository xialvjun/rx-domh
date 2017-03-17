/** @jsx h */
import h, { hr } from './h.js';

import Rx from 'rxjs';

var tt = [];
const _tocs = new Rx.BehaviorSubject();//.take(5);

//_tocs.subscribe(t => console.log(t))
_tocs.next(tt);

setInterval(()=>{
  let length = tt.length;
  if (length<10) {
    tt = tt.concat({title:length+'', description: 'desc'+length});
  } else {
    tt = tt.slice(0, 5);
  }
  _tocs.next(tt);
}, 1000);


// const abc$ = Observable.of(1)

// const _route = Observable.of({ pathname: 'list', params: null }); 

// 
// const root = (
// <div>
//   {_tocs.map(tocs=>tocs.length>0).distinctUntilChanged().combineLatest(Observable.of(gt0=>gt0?(
//     <ul>{_tocs.combineLatest(Observable.of(toc => <li data-title={toc.title}>1</li>))}</ul>
//   ):<div>jiangui</div>))}
// </div>
// )
// 

// 其实不需要 distinctUntilChanged，因为 h 方法会比较
const root = (
<div>
  {hr(_tocs.map(tocs=>tocs.length>0), gt0 => gt0 ? (
    <ul>{hr(_tocs, toc => <li data-title={toc.title}>1</li>)}</ul>
  ) : (<div>jiangui</div>))}
</div>
);

document.body.appendChild(root);
