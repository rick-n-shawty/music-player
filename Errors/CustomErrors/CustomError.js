const {StatusCodes, METHOD_FAILURE} = require('http-status-codes')
class CustomeError extends Error{
    constructor(message){
        super(message)
    }
}

class BadRequest extends CustomeError{
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.BAD_REQUEST
    }
}
class NotFound extends CustomeError{
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.NOT_FOUND
    }
}

class Unauthorized extends CustomeError{
    constructor(message){
        super(message)
        this.statusCode = StatusCodes.UNAUTHORIZED
    }
}

module.exports = {
    CustomeError, 
    NotFound, 
    BadRequest,
    Unauthorized
}