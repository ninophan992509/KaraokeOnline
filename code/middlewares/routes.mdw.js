const restrict = require('../middlewares/auth.mdw');

module.exports = function(app){
    
    app.use('/search', require('../routes/Search.route'));
    app.use('/account', require('../routes/account.route'));
    app.use('/record', require('../routes/record.route'));
    app.use('/media-player', require('../routes/mediaplayer.route'));
    
}