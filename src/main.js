/** @jsx h */
import h from './h.js'

import flyd from 'flyd'

var i = 0;
var tt = [];
const _tocs = flyd.stream();

//flyd.on(t => console.log(t), _tocs)
//_tocs.on()
setInterval(()=>{
  i++;
  tt = tt.concat({title:i+'', description: 'desc'+i});
  _tocs(tt);
}, 1000);

const abc$ = flyd.stream(1)

//const _route = Observable.of({ pathname: 'list', params: null }); 

const root = (
<div>
    {flyd.combine((gt0, render)=>([gt0(), render()]), [_tocs.map(tocs=>tocs.length>0), flyd.stream(gt0=>gt0?(
      <ul>{flyd.combine((gt0, render)=>([gt0(), render()]), [_tocs, flyd.stream(toc => <li data-title={toc.title}>{abc$}</li>)])}</ul>
    ):<div>jiangui</div>)])}
</div>
) 



document.body.appendChild(root);
