const { productSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Product = require('./models/product')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const product = await Product.findById(id)
    if (req.user._id == process.env.ADMIN_ID || product.author.equals(req.user._id)) {
        // do nothing all is good
    } else {
        console.log(req.user._id, product.author)
        req.flash('error', 'Cannot do that')
        return res.redirect(`/products/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params
    const review = await Review.findById(reviewID)
    if (!review.author.equals(req.user._id)) {
        await req.flash('error', 'Cannot do that')
        return res.redirect(`/products/${id}`)
    }
    next()
}