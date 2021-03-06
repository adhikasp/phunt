#!/usr/bin/env node
'use strict';

var fildes      = require('fildes');
var oshd        = require('os-homedir');
var vorpal      = require('vorpal')();
var unirest     = require('unirest');
var inquirer    = require('inquirer');
var chalk       = require('chalk');
var wrap        = require('wordwrap')(60);
var emoji       = require('node-emoji');

var config_file = oshd() + '/.phunt';
var api_url     = 'https://api.producthunt.com/v1';


/**
 * Initial
 */
function init(){
  fildes.open(config_file, {'flag': 'r'})
  .then(function(fd){
    fildes.readFile(config_file)
    .then(function(buffer){
      var config = JSON.parse(buffer);

      me(config.token, function(response){
        (response.code == 401) ? install(response.body.error_description) : start(config.token, response.body.user.username);
      });
    });
  })
  .catch(function(error){
    install('Before you use PHUNT, you need to add an application and create token from : https://www.producthunt.com/v1/oauth/applications.');
  });
}


/**
 * Installation
 */
function install(message){
  splash();
  console.log(wrap(chalk.dim(message) + '\n\n'));

  var questions = [
  {
    type    : "password",
    name    : "token",
    message : "Token: " + chalk.dim('(hidden)')
  }
  ];

  inquirer.prompt(questions, function(answers) {
    me(answers.token, function(response) {
      if(response.code == 401){
        install(response.body.error_description);
      }
      else {
        fildes.write(config_file, {'token': answers.token});
        start(answers.token, response.body.user.username)
      }
    });
  });
}


/**
 * Get current user
 * @param  {String}   token
 * @param  {Function} cb
 */
function me(token, cb){
  unirest
  .get(api_url + '/me')
  .header({
    'Accept'        : 'application/json',
    'Content-Type'  : 'application/json',
    'Authorization' : 'Bearer ' + token
  })
  .end(function (response) {
    cb(response)
  });
}


/**
 * Splash screen
 */
 function splash(){
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                   `ttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                      ttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                       tttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttt,      ttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;tttttttttttt,     ;tttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;tttttttttttt,     ;tttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttt,      ttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                       tttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                      ttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;                   ,ttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttt;     ;ttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttt                                       ttttttttttt'));
  console.log(chalk.dim('ttttttttttt    ') + chalk.bold('------------ PHUNT ------------') + chalk.dim('    ttttttttttt'));
  console.log(chalk.dim('ttttttttttt    PRODUCTHUNT COMMAND LINE CLIENT    ttttttttttt'));
  console.log(chalk.dim('ttttttttttt                                       ttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt'));
  console.log(chalk.dim('ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt\n'));
}


/**
 * Start application
 * @param  {String} token
 * @param  {String} username
 */
function start(token, username){
  splash();

  /**
   * Me
   * Get current user
   */
  vorpal
  .command('me', 'Get current user')
  .action(function(args, callback) {
    me(token, function(response){
      var user = response.body.user;

      vorpal.log('\n  ' + chalk.bold.blue(user.name) + ' ' + chalk.bold('(@' + user.username + ')'));
      vorpal.log('  ' + chalk.italic(user.headline));
      vorpal.log('  ' + chalk.dim('Followers') + ': ' + chalk.bold(user.followers_count) + '   ' + chalk.dim('Followings') + ': ' + chalk.bold(user.followings_count));
      vorpal.log('  ' + chalk.italic.underline.dim(user.profile_url) + '\n');
      callback();
    });
  });

  /**
   * Posts
   * Get the tech posts of today
   */
  vorpal
  .command('posts', 'Get the tech posts of today')
  .action(function(args, callback) {
    unirest
    .get(api_url + '/posts')
    .header({
      'Accept'        : 'application/json',
      'Content-Type'  : 'application/json',
      'Authorization' : 'Bearer ' + token
    })
    .end(function (response) {
      var body    = response.body;
      var posts   = body.posts;

      for (var i in posts) {
        vorpal.log(chalk.bold.blue('\n- ' + posts[i].name));
        vorpal.log('  ' + chalk.italic(posts[i].tagline));
        vorpal.log('  ' + emoji.get(':heart:') + ' ' + posts[i].votes_count + '   ' + emoji.get(':thought_balloon:') + ' ' + posts[i].comments_count);
        vorpal.log('  ' + chalk.italic.underline.dim(posts[i].discussion_url) + '\n');
      }

      callback();
    });
  });

  vorpal.delimiter('@' + username + ' => ').show();
}


// Here we go!
init();
