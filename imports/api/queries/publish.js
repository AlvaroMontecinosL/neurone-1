import { Meteor } from 'meteor/meteor';
import { Queries } from './collection';

if (Meteor.isServer) {
  Meteor.publish('queries', function() {
    const selector = { $and: [
      { owner: this.userId }, { owner: { $exists: true } }
    ]};
    
    return Queries.find(selector);
  });
}