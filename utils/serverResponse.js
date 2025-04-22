export default function serverResponse(req, status, message, data, other) {
  return req.status(status).json({
    status: status,
    message: message,
    data: data,
    ...other,
  });
}
