export default function(emitter, events) {
  emitter.on(
    events.ROOM_USER_JOINED,
    async ({ room, user }) => await room.addUser(user.id)
  );
  emitter.on(
    events.ROOM_USER_LEFT,
    async ({ room, user }) => await room.removeUser(user.id)
  );
}
