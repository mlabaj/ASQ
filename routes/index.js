/** @module routes/index */

/**
   Dummy function for root URL.
   This will be replaced.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};/** Renders the slideshow for viewers */
exports.live = function(req, res) {
    res.render('impress', {title: 'demo', mode:'viewer'})
}

/** Renders the slideshow for admin(s) */
exports.admin = function(req, res) {
    res.render('impress', {title: 'demo', mode:'admin'})
}