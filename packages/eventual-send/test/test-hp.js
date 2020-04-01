import test from 'tape-promise/tape';
import { HandledPromise } from '../src/index';

test('chained properties', async t => {
  try {
    const pr = {};
    const data = {};
    const queue = [];
    const handler = {
      applyMethod(_o, prop, args, target) {
        // Support: o~.[prop](...args) remote method invocation
        queue.push([0, prop, args, target]);
        return data;
        // return queueMessage(slot, prop, args);
      },
    };
    data.prop = new HandledPromise(_ => {}, handler);

    pr.p = new HandledPromise((res, rej, resolveWithRemote) => {
      pr.res = res;
      pr.rej = rej;
      pr.resPres = resolveWithRemote;
    }, handler);

    const hp = HandledPromise.applyMethod(
      HandledPromise.get(HandledPromise.applyMethod(pr.p, 'cont0', []), 'prop'),
      'cont1',
      [],
    );
    t.deepEqual(queue, [], `zeroth turn`);
    pr.resPres(handler);
    await hp;
    t.deepEqual(
      queue,
      [
        [0, 'cont0', [], hp],
        [0, 'cont1', [], hp],
      ],
      `first turn`,
    );
    await pr.p;
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});

test('HandledPromise.unwrap', async t => {
  try {
    for (const [val, desc] of [
      [{}, 'object'],
      [true, 'true'],
      [false, 'false'],
      [undefined, 'undefined'],
      [null, 'null'],
      [123, 'number'],
      ['hello', 'string'],
    ]) {
      t.equal(HandledPromise.unwrap(val), val, `unwrapped ${desc} is equal`);
    }
    const t0 = {
      then() {},
    };
    t.throws(
      () => HandledPromise.unwrap(t0),
      TypeError,
      `unwrapped thenable object throws`,
    );
    const t1 = () => {};
    t1.then = () => {};
    t.throws(
      () => HandledPromise.unwrap(t1),
      TypeError,
      `unwrapped thenable function throws`,
    );
    const p0 = new Promise(_ => {});
    t.throws(
      () => HandledPromise.unwrap(p0),
      TypeError,
      `unwrapped unfulfilled Promise throws`,
    );
    const p1 = new Promise(resolve => {
      resolve({});
    });
    t.throws(
      () => HandledPromise.unwrap(p1),
      TypeError,
      `unwrapped resolved Promise throws`,
    );
    const p2 = new Promise((_, reject) => {
      reject(Error('p2'));
    });
    // Prevent unhandled promise rejection.
    p2.catch(_ => {});
    t.throws(
      () => HandledPromise.unwrap(p2),
      TypeError,
      `unwrapped rejected Promise throws`,
    );
    const hp0 = new HandledPromise(_ => {});
    t.throws(
      () => HandledPromise.unwrap(hp0),
      TypeError,
      'unfulfilled HandledPromise throws',
    );
    const hp1 = new HandledPromise(resolve => {
      resolve({});
    });
    t.throws(
      () => HandledPromise.unwrap(hp1),
      TypeError,
      'resolved HandledPromise throws',
    );
    const hp2 = new HandledPromise((_, reject) => {
      reject(Error('hp2'));
    });
    // Prevent unhandled promise rejection.
    hp2.catch(_ => {});
    t.throws(
      () => HandledPromise.unwrap(hp2),
      TypeError,
      'rejected HandledPromise throws',
    );
    let remote;
    const hp3 = new HandledPromise((_res, _rej, resolveWithRemote) => {
      remote = resolveWithRemote({});
    });
    t.equals(typeof remote, 'object', `typeof remote is object`);
    t.equals(
      HandledPromise.unwrap(hp3),
      remote,
      `unwrapped HandledPromise is remote`,
    );
    t.equals(
      HandledPromise.unwrap(remote),
      remote,
      `unwrapped remote is remote`,
    );
    const hp4 = new HandledPromise(resolve => {
      resolve(hp3);
    });
    t.equals(
      HandledPromise.unwrap(hp4),
      remote,
      `unwrapped forwarded HandledPromise is remote`,
    );
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  } finally {
    t.end();
  }
});
