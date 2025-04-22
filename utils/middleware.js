// 3rd party modules
import jwt from "jsonwebtoken";

export async function checkAuthMiddleware(request, model, secretKey) {
  try {
    const reqAuthHeader = request.header("Authorization");
    if (!reqAuthHeader) {
      throw new Error("Unauthorized");
    }

    const token = reqAuthHeader.split(" ")[1] || null;

    if (!token) {
      throw new Error("Unauthorized");
    }

    // verify the token
    const decoded = jwt.verify(token, secretKey);

    if (!decoded) {
      throw new Error("Unauthorized");
    }

    const user = await model.findById(decoded._id);

    return {
      id: decoded._id,
      email: user.email,
    };
  } catch (error) {
    return null;
  }
}
