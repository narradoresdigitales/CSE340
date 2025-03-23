exports.throwError = (req, res, next) => {
    try {
        const error = new Error("This is a test error for Task 3.");
        error.status = 500;  // Set the status code to 500 for internal server error
        throw error;  // Throw the error
    } catch (error) {
        next(error);  // Pass the error to the middleware
    }
};
