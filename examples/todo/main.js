/** @jsx h */
import h, { hr } from 'rx-domh';

import Rx from 'rxjs';

const todos$ = new Rx.BehaviorSubject([]);
const route$ = new Rx.BehaviorSubject('all');

let showing_todos$ = Rx.Observable.combineLatest(todos$, route$, (todos, route)=>{
  if (route=='completed') {
    return todos.filter(todo => todo.completed);
  }
  if (route=='not completed') {
    return todos.filter(todo => !todo.completed);
  }
  return todos;
});


let add_click$ = new Rx.Subject();
add_click$.subscribe(e => {
  if (text_input.value) {
    todos$.next(todos$.value.concat({content: text_input.value, completed: false}));
    text_input.value = '';
  }
});

const text_input = <input type="text" />

const root = (
<div>
  {hr(showing_todos$.map(todos=>todos.length>0), gt0 => gt0 ? (
    <ul>{hr(showing_todos$, todo => (
      <li style={todo.completed ? 'text-decoration:line-through;' : null} 
        onclick={e=>{todo.completed=!todo.completed; todos$.next(todos$.value);}}>{todo.content}</li>
    ))}</ul>
  ) : (<div>No One, Please Add</div>))}
  <div>
    {text_input}
    <button onclick={add_click$.next.bind(add_click$)}>add</button>
    <button onclick={route$.next.bind(route$, 'all')}>all</button>
    <button onclick={route$.next.bind(route$, 'completed')}>completed</button>
    <button onclick={route$.next.bind(route$, 'not completed')}>not completed</button>
  </div>
</div>
);

document.body.appendChild(root);
