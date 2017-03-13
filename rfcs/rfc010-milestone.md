import { Observable, Subscription, Subject } from 'rxjs'
import lodash from 'lodash'

function h(tag, attrs, ...children) {
  if (tag==='txt') {
    return document.createTextNode(attrs);
  }
  children = lodash.flattenDeep(children);
  let element = document.createElement(tag);
  let subscriptions = [];
  for (let key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      let value = attrs[key];
      if (value instanceof Observable) {
        subscriptions.push(value.subscribe(v => element.setAttribute(key, v)));
      } else {
        element.setAttribute(key, value);
      }
    }
  }
  for (let index = 0; index < children.length; index++) {
    let child = children[index];
    if (child instanceof Observable) {
      subscriptions.push(child.subscribe(cs => {
        console.log(123);
        // cs = [].concat(cs);
        // let cnode = element.childNodes[index];
        // if (cnode) {
        //   if (c) {
        //     element.replaceChild(c, cnode);
        //   } else {
        //     dh(cnode);
        //     let placeholder = document.createComment('placeholder for h');
        //     element.replaceChild(placeholder, cnode);
        //   }
        // } else {
        //   if (c) {
        //     element.appendChild(c);
        //   } else {
        //     let placeholder = document.createComment('placeholder for h');
        //     element.appendChild(placeholder);
        //   }
        // }
      }));
    } else {
      element.appendChild(child);
    }
  }
  element['subscriptions'] = subscriptions;
  return element;
}

function dh(ele) {
  (ele['subscriptions'] || []).forEach(sub => sub.unsubscirbe());
  ([].slice.call(ele.childNodes)).forEach(cn => dh(cn));
}

// const _hash = Observable.of(location.hash).merge(Observable.fromEvent(window, 'hashchange').map(e => location.hash));

// const _scroll_top = Observable.fromEvent(window, 'scroll').map(e => Object(e).target.scrollTop)

const _url = new Subject().startWith(document.getElementById('toc').querySelector('a.old_toc')['href']);

const _tocs = Observable
  .of([].slice.call(document.getElementById('toc').querySelectorAll('a.post')).map(a => {
    a.dataset.href = a.href;
    return a.dataset;
  }))
  .combineLatest(_url.map(url => fetch(url)).scan((acc, cv) => acc.concat(cv), []), function(first, rest) {
    return [].concat(first).concat(rest);
  });

// Observable.combineLatest();

const _routed = Observable.of({ pathname: 'list', params: null });

// const root = h('div', {}, [
//   _routed.map(route => {
//     switch (route.pathname) {
//       case 'list': {
//         // return _tocs.scan((ul, tocs) => {
//         //   let old_tocs = ul['__data'];
//         //   ul['__data'] = tocs;

//         //   return ul;
//         // }, document.createElement('ul'))
//         return h('ul', {},
//           _tocs.scan((lis: any, tocs) => {
//             let old_tocs = lis['__data'] || [];
//             // lis['__data'] = tocs;
//             if (!tocs || tocs.length===0) {
//               let placeholder = [document.createComment('placeholder')];
//               placeholder['__data'] = tocs;
//               return placeholder;
//             } else {
//               let render = toc => h('li', {data_title: toc.title}, document.createTextNode(toc.description));
//               // lodash.pickBy('href', [{href:123},{href:123},{href:123}])
//               let old = lodash.zipWith(old_tocs, lis, (toc, li) => ({toc, li}));
//               let nwe = [];
//               tocs.forEach(toc => {
//                 let found = old.find(o => lodash.isEqual(toc, o['toc']));
//                 if (found) {
//                   nwe.push(found['li']);
//                 } else {
//                   nwe.push(render(toc));
//                 }
//               });
//               let parent = lis[0].parentElement;
//               let pos = lis[0];
//               nwe.slice().reverse().forEach(n => parent.insertBefore(n, pos));
//               lis.filter(li => nwe.indexOf(li)===-1).forEach(li => {dh(li);li.remove();});
//               nwe['__data'] = tocs;
//               return nwe;
//             }
//           }, [document.createComment('placeholder')])
//         );
//       };
//       default: {
//         return h('div', {}, h('txt', '404 Not Found'));
//       };
//     }
//   })
// ]);

const root = h('div', {}, [
  _routed.scan((ele, route) => {
    let render = route => {
      switch (route.pathname) {
        case 'list': {
          return h('ul', {}, [
            _tocs.delay(1000).scan((lis, tocs) => {
              let old_tocs = lis['__data'] || [];
              // lis['__data'] = tocs;
              if (!tocs || tocs.length===0) {
                let placeholder = [document.createComment('placeholder')];
                placeholder['__data'] = tocs;
                return placeholder;
              } else {
                let render = toc => h('li', {data_title: toc.title}, document.createTextNode(toc.description));
                // lodash.pickBy('href', [{href:123},{href:123},{href:123}])
                let old = lodash.zipWith(old_tocs, lis, (toc, li) => ({toc, li}));
                let nwe = [];
                tocs.forEach(toc => {
                  let found = old.find(o => lodash.isEqual(toc, o['toc']));
                  if (found) {
                    nwe.push(found['li']);
                  } else {
                    nwe.push(render(toc));
                  }
                });
                let parent = lis[0].parentElement;
                let pos = lis[0];
                nwe.slice().reverse().forEach(n => parent.insertBefore(n, pos));
                lis.filter(li => nwe.indexOf(li)===-1).forEach(li => {dh(li);li.remove();});
                nwe['__data'] = tocs;
                return nwe;
              }
            }, [document.createComment('placeholder')])
          ]);
        };
        default: {
          return h('div', {}, h('txt', '404 Not Found'));
        };
      }
    }
    if (!route) {
      dh(ele);
      let nwe = document.createElement('placeholder');
      ele.parentElement.insertBefore(nwe, ele);
      ele.remove();
      return nwe;
    } else {
      if (lodash.isEqual(route, ele['__data'])) {
        return ele;
      } else {
        dh(ele);
        let nwe = render(route);
        ele.parentElement.insertBefore(nwe, ele);
        ele.remove();
        nwe['__data'] = route;
        return nwe;
      }
    }
  }, document.createComment('placeholder'))
]);

// lodash.flattenDeep([1, [2, [3, 4], 5], 6])
document.body.appendChild(root)