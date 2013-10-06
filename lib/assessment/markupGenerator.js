/** @module lib/asqAssessmentMarkupGenerator
    @description Parse HTML files to extract assessment information
*/

var cheerio = require('cheerio')
, sugar     = require('sugar')
, when      = require('when')
, _         = require("underscore")
, dustfs    = require('dustfs')

// default options for template names, selectors etc.
, defaultOptions={
  outputFormat : 'Array',
  templates : {
    'multi-choice' : {
      'teacher' : 'questionList-teacher.dust',
      'student' : 'questionList-student.dust' 
      },
      'text-input' : {
        'teacher' : 'questionTextInput.dust',
        'student' : 'questionTextInput.dust'
      },
      'stats':  {
        'teacher' : 'stats.dust',
        'student'  : 'answer.dust',
      },      
      'welcome-screen' : {
        'teacher' : 'welcomeScreen-teacher',
        'student' : 'welcomeScreen-student' 
      }
    }
  };

function renderOne($el, question, userType){
  var deferred = when.defer();

  var template = defaultOptions.templates[question.questionType][userType]
  if(template === undefined){
    deferred.reject(new Error("Invalid template"));
  }

  dustfs.render(template, {question:question, userType:userType}, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

   $el.attr('data-question-id', question.id);
   $el.find('ol').remove();
   $el.find('.stem').after(out)
  
    deferred.resolve(out);
  });

  return deferred.promise;
}

function renderStat($stat, data, userType){
  var deferred = when.defer();
  dustfs.render(defaultOptions.templates.stats[userType], data, function(err, out) {
    if(err) {
      deferred.reject(err)
    }
    $stat.html(out);
    $stat.attr('data-target-assessment-id', data.question.id);
    deferred.resolve(out);
  });
  return deferred.promise;
}

function renderAll($, questions, userType){
    var deferreds = [];

    //loat dust templates
    var loading = dustfs.dirs('views/asq-render/');

    //the way dustfs works, adds listener per dust.render 
    //call to the monitored directories. Since we have a lot
    // of async renders we may have many listeners simultaneously
    // and trigger the maxlisteners error of node (for >10 listeners)
    // that's why we increase the listeners
    loading.setMaxListeners(1000);


    //inject welcome-screen dust
    $('.asq-welcome-screen').html('{>"asq-render/'+defaultOptions.templates['welcome-screen'][userType]+'.dust"/}')

    var statId =0;
    // render questions
    _.each(questions, function(question){
      //render question
      deferreds.push(renderOne($('#' + question.htmlId), question, userType));

      //render stats or answers
      _.each($('.stats[data-target-assessment="' +question.htmlId+ '"]'), function(stat){
          deferreds.push(renderStat($(stat), {question:question, statId: ++statId}, userType));
      });
    })

    //inject dust vars for socket params in body data attrs
    $('body')
      .attr('data-asq-host', '{host}')
      .attr('data-asq-port', '{port}')
      .attr('data-asq-session-id', '{id}')
      .attr('data-asq-socket-mode', '{mode}');


    //if teacher render stat slides
    if(userType === "teacher"){

      //add teacher scripts       
      $('script[src$="impress.js"]')
        .attr('src', "/js/asq-presenter.js" )

    }else{ //we are not admin so render answer slides

        //add student scripts
      $('script[src$="impress.js"]')
        .attr('src', "/js/asq-viewer.js" )
    }

    
  return when.all(deferreds);

}

function render(html, questions, userType){
  var $ = cheerio.load(html)
  , deferred = when.defer();

  renderAll($, questions, userType).then(function(){
    
    deferred.resolve($.html());
  },
  function(err){
    deferred.reject(error);
  })

  return deferred.promise;
}

module.exports = {
  render : render
}