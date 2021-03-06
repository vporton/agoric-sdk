import harden from '@agoric/harden';

console.log(`=> loading bootstrap.js`);

export default function setup(syscall, state, helpers) {
  function log(what) {
    helpers.log(what);
    console.log(what);
  }
  log(`=> setup called`);
  return helpers.makeLiveSlots(
    syscall,
    state,
    E =>
      harden({
        bootstrap(argv, vats) {
          console.log('=> Alice: bootstrap() called');

          let resolver;
          const param = new Promise((theResolver, _theRejector) => {
            resolver = theResolver;
          });
          log('Alice: sending the promise to Bob');
          const response = E(vats.bob).thisIsYourPromise(param);
          log('Alice: resolving the promise that was sent to Bob');
          resolver('Alice says hi!');
          log(`Alice: awaiting Bob's response`);
          // prettier-ignore
          response.then(
            r => log(`=> Alice: Bob's response to thisIsYourPromise resolved to '${r}'`),
            e => log(`=> Alice: Bobs' response to thisIsYourPromise rejected as '${e}'`),
          );
          log('=> Alice: bootstrap() done');
          return 'Alice started';
        },
      }),
    helpers.vatID,
  );
}
