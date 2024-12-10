let posts = [];
let categories = [];

// Function to initialize data
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        try {
            // Simulated initialization (can use database logic here if needed)
            posts = [
                { id: 1, title: "First Post", postDate: "2024-11-29", category: "Tech", published: true },
                { id: 2, title: "Second Post", postDate: "2024-12-01", category: "General", published: false },
            ];
            categories = [
                { id: 1, name: "Tech" },
                { id: 2, name: "General" },
            ];
            resolve();
        } catch (err) {
            reject("Unable to initialize blog data.");
        }
    });
};

// Function to get all posts
module.exports.getPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length > 0) resolve(posts);
        else reject("No posts available.");
    });
};

// Function to get all categories
module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) resolve(categories);
        else reject("No categories available.");
    });
};

// Function to add a new post
module.exports.addPost = function (post) {
    return new Promise((resolve, reject) => {
        try {
            post.id = posts.length + 1; // Auto-increment ID
            posts.push(post);
            resolve();
        } catch (err) {
            reject("Unable to add post.");
        }
    });
};

// Function to delete a post by ID
module.exports.deletePost = function (id) {
    return new Promise((resolve, reject) => {
        const index = posts.findIndex((post) => post.id == id);
        if (index > -1) {
            posts.splice(index, 1);
            resolve();
        } else {
            reject("Post not found.");
        }
    });
};

// Function to add a new category
module.exports.addCategory = function (category) {
    return new Promise((resolve, reject) => {
        try {
            category.id = categories.length + 1; // Auto-increment ID
            categories.push(category);
            resolve();
        } catch (err) {
            reject("Unable to add category.");
        }
    });
};

// Function to delete a category by ID
module.exports.deleteCategory = function (id) {
    return new Promise((resolve, reject) => {
        const index = categories.findIndex((category) => category.id == id);
        if (index > -1) {
            categories.splice(index, 1);
            resolve();
        } else {
            reject("Category not found.");
        }
    });
};
