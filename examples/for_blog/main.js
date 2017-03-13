
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';

import h from './h.js'

const _tocs = new Subject();
const tt = [{ "layout": "post", "title": "青蛙跳台阶的问题——Fibonacci", "categories": "Algorithm", "description": "使用 Fibonacci 来解决青蛙跳台阶的问题。", "keywords": "算法, Fibonacci", "href": "posts/2017-03-11-fibonacci.md" }];

setTimeout(() => {
  _tocs.next(tt);
  setTimeout(() => {
    _tocs.next(tt.concat({ "layout": "post", "title": "青蛙跳台阶的问题2222——Fibonacci", "categories": "Algorithm", "description": "使用 Fibonacci 来解决青蛙跳台阶的问题2222。", "keywords": "算法, Fibonacci", "href": "posts/2017-03-11-fibonacci.md" }));
  }, 5000);
}, 0);

window._tocs = _tocs;

const _route = Observable.of({ pathname: 'list', params: null });

const root = h('div', {}, [
  _route.combineLatest(Observable.of(route => {
    switch (route.pathname) {
      case 'list':
        return h('ul', {}, [
          _tocs.combineLatest(Observable.of(toc => h('li', { data_title: toc.title }, document.createTextNode(toc.description))))
        ]);
      default:
        return h('div', {}, [h('txt', '404 Not Found')]);
    }
  }))
]);

document.body.appendChild(root);