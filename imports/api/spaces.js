import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Spaces = new Mongo.Collection('spaces');

if (Meteor.isServer) {
  Meteor.publish('spaces', function spacesPublication() {
    return Spaces.find();
  });
}

Meteor.methods({
  'spaces.insert'(name, description, price) {
    check(name, String);
    check(description, String);
    check(price, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Spaces.insert({
      name: name,
      createdAt: new Date(),
      description: description,
      price: price,
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      booked: false,
      bookedBy: null,
      approved: false,
      requestedBy: [],
      requested: false,
    });
  },
  'spaces.remove'(spaceId) {
    check(spaceId, String);

    const space = Spaces.findOne(spaceId);
    if (space.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Spaces.remove(spaceId);
  },
  'spaces.setBooked'(spaceId, setBooked) {
    check(spaceId, String);
    check(setBooked, Boolean);
    const space = Spaces.findOne(spaceId);
    Spaces.update(spaceId, { $set: { booked: setBooked } });
    Spaces.update(spaceId, {
      $set: { bookedBy: space.requestedBy}
    });
  },
  'spaces.setRequest'(spaceId, setRequest) {
    check(spaceId, String);
    check(setRequest, Boolean);
    let username = Meteor.users.findOne(this.userId).username;
    const space = Spaces.findOne(spaceId);
    if (!space.requestedBy.includes(username)) {
      space.requestedBy.push(username);
    }
    Spaces.update(spaceId, { $set: { requested: setRequest } });
    Spaces.update(spaceId, {
      $set: { requestedBy: space.requestedBy }
    });
  }
});
