class ResponseHelper {
  static success(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    }
    return res.status(statusCode).json(response)
  }

  static error(res, message = "An error occurred", statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
    }
    return res.status(statusCode).json(response)
  }

  static validationError(res, errors) {
    return this.error(res, "Validation failed", 400, errors)
  }

  static notFound(res, resource = "Resource") {
    return this.error(res, `${resource} not found`, 404)
  }

  static unauthorized(res, message = "Unauthorized access") {
    return this.error(res, message, 401)
  }

  static forbidden(res, message = "Access forbidden") {
    return this.error(res, message, 403)
  }

  static conflict(res, message = "Resource conflict") {
    return this.error(res, message, 409)
  }

  static tooManyRequests(res, message = "Too many requests") {
    return this.error(res, message, 429)
  }

  static created(res, data = null, message = "Resource created successfully") {
    return this.success(res, data, message, 201)
  }

  static updated(res, data = null, message = "Resource updated successfully") {
    return this.success(res, data, message, 200)
  }

  static deleted(res, message = "Resource deleted successfully") {
    return this.success(res, null, message, 200)
  }

  static paginated(res, data, pagination, message = "Data retrieved successfully") {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    }
    return res.status(200).json(response)
  }
}

module.exports = ResponseHelper
