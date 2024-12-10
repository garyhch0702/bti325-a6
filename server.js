/*********************************************************************************
*  BTI325 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students.
* 
*  Name: Chenghao Hu    Student ID: 149773228   Date: December 10, 2024
*
*  Online (Vercel) Link: ________________________________________________________
*
********************************************************************************/ 

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
const exphbs = require('express-handlebars');
const blogData = require('../blog-service');
const authData = require('../auth-service');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(clientSessions({
    cookieName: "session",
    secret: "BTI325_A6_secret_key",
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

// Handlebars Setup
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return (
                '<li class="nav-item' +
                ((url == app.locals.activeRoute) ? ' active' : '') +
                '"><a class="nav-link" href="' + url + '">' +
                options.fn(this) +
                '</a></li>'
            );
        },
        equal: function (lvalue, rvalue, options) {
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname,  'views'));


app.use((req, res, next) => {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
    next();
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/blog');
});

app.get('/blog', (req, res) => {
    const { postId, category } = req.query;
    let viewData = {};

    blogData.getCategories()
        .then((categories) => {
            viewData.categories = categories;
            return blogData.getPosts();
        })
        .then((posts) => {
            viewData.posts = posts;

            if (postId) {
                viewData.post = posts.find(post => post.id == postId);
            } else if (category) {
                viewData.posts = posts.filter(post => post.category == category);
            }

            res.render('blog', viewData);
        })
        .catch(err => {
            viewData.message = "Unable to load blog posts.";
            res.render('blog', viewData);
        });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => res.render('register', { successMessage: "User successfully registered!" }))
        .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/posts');
        })
        .catch((err) => {
            res.render('login', { errorMessage: err, userName: req.body.userName });
        });
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/login');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user });
});

app.get('/posts', ensureLogin, (req, res) => {
    blogData.getPosts()
        .then((posts) => res.render('posts', { posts }))
        .catch((err) => res.render('posts', { message: "No posts available." }));
});

app.get('/posts/add', ensureLogin, (req, res) => {
    blogData.getCategories()
        .then((categories) => res.render('addPost', { categories }))
        .catch((err) => res.render('addPost', { message: "Unable to load categories." }));
});

app.post('/posts/add', ensureLogin, (req, res) => {
    blogData.addPost(req.body)
        .then(() => res.redirect('/posts'))
        .catch((err) => res.status(500).send("Unable to add post."));
});

app.post('/posts/delete/:id', ensureLogin, (req, res) => {
    blogData.deletePost(req.params.id)
        .then(() => res.redirect('/posts'))
        .catch((err) => res.status(500).send("Unable to delete post."));
});

app.get('/categories', ensureLogin, (req, res) => {
    blogData.getCategories()
        .then((categories) => res.render('categories', { categories }))
        .catch((err) => res.render('categories', { message: "No categories available." }));
});

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', ensureLogin, (req, res) => {
    blogData.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch((err) => res.status(500).send("Unable to add category."));
});

app.post('/categories/delete/:id', ensureLogin, (req, res) => {
    blogData.deleteCategory(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch((err) => res.status(500).send("Unable to delete category."));
});

blogData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Unable to start server: ${err}`);
    });
