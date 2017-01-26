import { Meteor } from 'meteor/meteor';

import Utils from '../lib/utils';

import { UserData } from '../../imports/database/userData/index';
import { Settings } from '../../imports/database/settings/index';
import { Identities } from '../../imports/database/identities/index';

Meteor.methods({
  userDataFromId: function(userId) {
    // dgacitua: Server-only method
    // https://github.com/themeteorchef/server-only-methods
    try {
      check(userId, String);

      console.log(Meteor.users.findOne({ _id: userId }).username);
      if (this.connection == null) return Meteor.users.findOne({ _id: userId });
      else return undefined;
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not get User Data from userId!', err);
    }
  },
  userRole: function() {
    try {
      if (this.userId) {
        return UserData.findOne({ userId: this.userId }).role;
      }
      else {
        return '';
      }
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not read user session!', err);
    }
  },
  userSession: function() {
    try {
      if (this.userId) {
        //var met = Meteor.wrapAsync(UserData.findOne),
        //   call = met({ userId: this.userId });

        //return call.session;
        return UserData.findOne({ userId: this.userId }).session;
      }
      else {
        return {};
      }
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not read user session!', err);
    }
  },
  userConfigs: function() {
    try {
      if (this.userId) {
        //var met = Meteor.wrapAsync(UserData.findOne),
        //   call = met({ userId: this.userId });

        //return call.configs;
        return UserData.findOne({ userId: this.userId }).configs;
      }
      else {
        return {};
      }
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not read user configs!', err);
    }
  },
  setSession: function(property) {
    try {
      if (this.userId) {
        var setObj = {};

        for (var key in property) {
          setObj['session.' + key] = property[key];
        }
        
        UserData.update({ userId: this.userId }, { $set: setObj });
        
        return UserData.findOne({ userId: this.userId }).session;
      }
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not update user session!', err);
    }
  },
  initialConfigs: function(topic, test) {
    try {
      var envSettings = Settings.findOne({ envSettingsId: 'default' }),
         userSettings = null;

      if (!!test && !!topic) {
        userSettings = Settings.findOne({ test: test, topic: topic });
      }
      else {
        userSettings = Settings.findOne({ userSettingsId: envSettings.userSettings }); 
      }

      delete userSettings._id;

      return userSettings;
    }
    catch (err) {
      throw new Meteor.Error('UserDataError', 'Could not read initial user configs!', err);
    }
  },
  registerUsers: function(userList) {
    check(userList, Array);

    userList.forEach((user, idx, arr) => {
      let tempCredentials = {
        username: user.username,
        password: user.password,
        role: 'student',
        configs: {},
        session: {},
        profile: {}
      };

      let topic, test, userSettings;

      if (user.domain === 'SS') topic = 'social';
      else if (user.domain === 'SC') topic = 'science';
      else topic = 'pilot';

      if (user.task === 'E') test = 'email';
      else if (user.task === 'A') test = 'article';
      else test = 'pilot';

      userSettings = Settings.findOne({ test: test, topic: topic });

      if (!(!!userSettings)) {
        arr[idx].status = 'ConfigError';
      }
      else {
        tempCredentials.configs = userSettings;

        let id = Accounts.createUser(tempCredentials);

        if (!(!!id)) {
          arr[idx].status = 'RegisterError';
        }
        else {
          arr[idx].status = 'Registered';
        }
      }
    });

    return userList;
  },
  registerIdentity: function(id) {
    try {
      check(id, String);

      if (this.userId) {
        var time = Utils.getTimestamp();

        var identity = {
          userId: this.userId,
          username: Meteor.user().username,
          identity: id,
          serverDate: Utils.timestamp2date(time),
          serverTime: Utils.timestamp2time(time),
          serverTimestamp: time
        };

        var result = Identities.insert(identity);
       
        if (!!result) return identity;
        else return false;
      }
    }
    catch (err) {
      console.error(err);
      throw new Meteor.Error('UserRegisterError', 'Could not register new user!', err);
    }
  }
});