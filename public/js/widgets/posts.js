'use strict';

/* global ghost */

/* eslint-disable
  max-statements
*/

(function () {

  // The wrapper element where the recent posts will be displayed
  var wrapper = document.querySelector('#posts ol');

  /**
   * Renders a generic message instead of recent posts
   * Used when the Ghost API fails or throws an error
   * @return {undefined} No return
   */
  var renderErrorFallback = function renderErrorFallback() {
    wrapper.innerHTML = '\n    <p><a class=error-fallback href=http://blog.danielhieber.com/>Check out my blog for recent posts!</a></p>\n    ';
  };

  // Displays the 5 most recent posts from the Ghost API
  /**
   * Displays the 5 most recent posts from the Ghost API
   * @param  {Array} posts An array of posts to display
   * @return {undefined} No return
   */
  var renderPosts = function renderPosts(posts) {

    // If there are no recent posts, it's probably an error - render the fallback
    if (posts.length === 0) {

      renderErrorFallback();

      // Otherwise render each post
    } else {

      posts.forEach(function (post) {

        // template variables
        var postLink = 'http://blog.danielhieber.com/' + post.slug;
        var d = new Date(post.updated_at);
        var dateString = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

        var imgLink = '';

        if (post.image) {
          imgLink = post.image.includes('//') ? post.image : '//blog.danielhieber.com' + post.image;
        }

        // get a preview of the post's text content
        var p = document.createElement('p');
        var previewLength = 240;
        var img = imgLink ? '<img src=' + imgLink + '>' : '';

        p.innerHTML = post.html;
        var preview = p.textContent.substring(0, previewLength);

        // the template for each item in the recent posts list
        var html = '\n          <li>\n            <a href=' + postLink + '>\n              ' + img + '\n              <div>\n                <h2>' + post.title + '</h2>\n                <time datetime=' + post.updated_at + '>' + dateString + '</time>\n                <p>' + preview + ' ... <span>(read more)<span></p>\n              </div>\n            </a>\n          </li>\n        ';

        wrapper.insertAdjacentHTML('beforeend', html);
      });
    }
  };

  if (ghost) {

    // initialize the Ghost SDK
    ghost.init({
      clientId: 'ghost-frontend',
      clientSecret: '5abb38b97759'
    });

    // parameters to send to the Ghost API
    var ghostOptions = {
      limit: 5,
      fields: 'title,slug,image,updated_at,html'
    };

    // construct the URL to fetch recent posts
    var recentPostsUrl = ghost.url.api('posts', ghostOptions);

    // call the Ghost API, convert and render the result
    fetch(recentPostsUrl).then(function (res) {
      if (res.ok) {
        res.json().then(function (data) {
          return renderPosts(data.posts);
        });
      } else {
        renderErrorFallback();
      }
    }).catch(renderErrorFallback);
  } else {
    // display the error fallback if the Ghost API is unavailable
    renderErrorFallback();
  }
})();