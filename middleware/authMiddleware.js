const checkAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/login'); // User is not authenticated, redirect to login page
};

module.exports = checkAuthenticated;