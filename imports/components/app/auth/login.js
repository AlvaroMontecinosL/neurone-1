import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import Utils from '../../globalUtils';

import template from './login.html';

import { name as Register } from './register';

class Login {
  constructor($scope, $reactive, $state, AuthService) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
    this.auth = AuthService;

    $reactive(this).attach($scope);

    this.credentials = {
      email: '',
      password: ''
    };

    this.error = '';
  }

  login() {
    this.auth.login(this.credentials.email, this.credentials.password, (err, res) => {
      if (!err) {
        this.error = res;
        this.$state.go('search');
      }
      else {
        this.error = err;
      }
    });
    /*
    Meteor.loginWithPassword(this.credentials.email, this.credentials.password,
      this.$bindToContext((err) => {
        if (err) {
          this.error = err;
        } else {
          //console.log(Meteor.user(), Meteor.user().emails[0].address);
          this.sts.saveLogin();
          this.fs.startFlow();
          UserStatus.startMonitor({ threshold: Utils.sec2millis(30), interval: Utils.sec2millis(1), idleOnBlur: true });
          this.$state.go('search');
        }
      })
    );
    */
  }
}

const name = 'login';

// create a module
export default angular.module(name, [
  angularMeteor,
  uiRouter
])
.component(name, {
  template,
  controllerAs: name,
  controller: Login
})
.config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider.state('login', {
    url: '/login',
    template: '<login></login>'
  });
}
