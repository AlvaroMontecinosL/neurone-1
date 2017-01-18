import { Meteor } from 'meteor/meteor';

import Utils from '../lib/utils';

import { Documents } from '../../imports/api/documents/index';
import { Snippets } from '../../imports/api/snippets/index';
import { Queries } from '../../imports/api/queries/index';
import { Bookmarks } from '../../imports/api/bookmarks/index';
import { UserData } from '../../imports/api/userData/index';

Meteor.methods({
  getSnippets: function(limit) {
    try {
      var selector = { sort: { serverTimestamp: -1 }};
      if (limit) selector.limit = limit;
      return Snippets.find({ userId: this.userId, action: 'Snippet' }, selector).fetch();
    }
    catch (err) {
      throw new Meteor.Error('DatabaseError', 'Could not read Snippets from Database!', err);
    }
  },
  getBookmarks: function(limit) {
    try {
      var selector = { sort: { serverTimestamp: -1 }};

      // dgacitua: https://coderwall.com/p/o9np9q/get-unique-values-from-a-collection-in-meteor
      // var docs = Bookmarks.find({ userId: this.userId, action: 'Bookmark' }, selector).fetch();
      
      // dgacitua: Imported from https://github.com/monbro/meteor-mongodb-mapreduce-aggregation/
      var bms = _.uniq(Bookmarks.find({ userId: this.userId, action: 'Bookmark' }, selector).fetch(), (x) => { return x.url });
      if (limit) return bms.slice(-(limit));
      else return bms;
    }
    catch (err) {
      throw new Meteor.Error('DatabaseError', 'Could not read Bookmarks from Database!', err);
    }
  },
  isBookmark: function(currentUrl) {
    check(currentUrl, String);

    try {
      var bkm = Bookmarks.findOne({ userId: this.userId, url: currentUrl },  { sort: { serverTimestamp: -1 }});

      if (bkm && bkm.action === 'Bookmark') return true;
      else return false;
    }
    catch (err) {
      throw new Meteor.Error('DatabaseError', 'Could not read Bookmark Status from Database!', err);
    }
  },
  getRelevantDocuments: function() {
    try {
      if (this.userId) {
        var user = UserData.findOne({ userId: this.userId }),
           limit = user.configs.maxBookmarks,
            docs = Documents.find({ relevant: true }, { limit: limit }).fetch();

        return docs;
      }
      else {
        return Documents.find({ relevant: true }).fetch();
      }
    }
    catch (err) {
      throw new Meteor.Error('DatabaseError', 'Could not get Relevant Documents from Database!', err);
    }
  },
  getBookmarkScore: function() {
    try {
      if (this.userId) {
        // TODO complete function
        var score = 0;
        return score;
      }
      else {
        return 0;
      }
    }
    catch (err) {
      throw new Meteor.Error('DatabaseError', 'Could not get Bookmark Score from Database!', err);
    }
  }
});

Meteor.publish({
  userBookmarks: function() {
    if (this.userId) {
      var user = UserData.findOne({userId: this.userId}),//Meteor.users.findOne(this.userId),
         limit = user.configs.maxBookmarks,
          pipe = [
                  { $match: { userId: this.userId }},
                  { $sort: { serverTimestamp: -1 }},
                  { $group: { _id: '$docId', originalId: {$first: '$_id'}, userId: {$first: '$userId'}, title: {$first: '$title'}, action: {$first: '$action'}, relevant: {$first: '$relevant'}, url: {$first: '$url'}}},
                  { $project: { _id: '$originalId', docId: '$_id', userId: '$userId', title: '$title', action: '$action', relevant: '$relevant', url: '$url'}},
                  { $match: { action: 'Bookmark' }},
                  { $limit: limit }
                ];

      ReactiveAggregate(this, Bookmarks, pipe, { clientCollection: 'UserBookmarks' });
    }
    else {
      this.ready();
    }
  },
  userSnippets: function() {
    if (this.userId) {
      // dgacitua: http://stackoverflow.com/a/40266075
      var user = UserData.findOne({userId: this.userId}),//Meteor.users.findOne(this.userId),
         limit = user.configs.maxSnippetsPerPage,
          pipe = [
                  { $match: { userId: this.userId }},
                  { $sort: { serverTimestamp: -1 }},
                  { $group: { _id: '$snippetId', originalId: {$first: '$_id'}, userId: {$first: '$userId'}, title: {$first: '$title'}, action: {$first: '$action'}, snippedText: {$first: '$snippedText'}, url: {$first: '$url'}, docId: {$first: '$docId' }, serverTimestamp: { $first: '$serverTimestamp' }}},
                  { $project: { _id: '$originalId', snippetId: '$_id', userId: '$userId', title: '$title', action: '$action', snippedText: '$snippedText', url: '$url', docId: '$docId', serverTimestamp: '$serverTimestamp' }},
                  { $sort: { serverTimestamp: -1 }},
                  { $match: { action: 'Snippet' }},
                  { $group: { _id: '$docId', doc: { $push: { originalId: '$_id', snippetId: '$snippetId', userId: '$userId', title: '$title', action: '$action', snippedText: '$snippedText', url: '$url', docId: '$docId', serverTimestamp: '$serverTimestamp' }}}},
                  { $project: { snippets: { $slice: ['$doc', limit] }}},
                  { $unwind: { path: '$snippets' }},
                  { $project: { _id: '$snippets.originalId', docId: '$_id', userId: '$snippets.userId', snippetId: '$snippets.snippetId', snippedText: '$snippets.snippedText', title: '$snippets.title', action: '$snippets.action', url: '$snippets.url', serverTimestamp: '$snippets.serverTimestamp' }},
                  { $sort: { serverTimestamp: 1 }}
                ];

      ReactiveAggregate(this, Snippets, pipe, { clientCollection: 'UserSnippets' });
    }
    else {
      this.ready();
    }
  }
});