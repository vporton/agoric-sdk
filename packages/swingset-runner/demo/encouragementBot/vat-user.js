import harden from '@agoric/harden';

export default function setup(syscall, state, helpers) {
  function log(what) {
    helpers.log(what);
    console.log(what);
  }
  return helpers.makeLiveSlots(
    syscall,
    state,
    E =>
      harden({
        talkToBot(bot, botName) {
          log(`=> user.talkToBot is called with ${botName}`);
          E(bot)
            .encourageMe('user')
            .then(myEncouragement =>
              log(`=> user receives the encouragement: ${myEncouragement}`),
            );
          return 'Thanks for the setup. I sure hope I get some encouragement...\nuser vat is happy\n';
        },
      }),
    helpers.vatID,
  );
}
