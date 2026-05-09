// src/middleware/validation.js
export const validation = (schema) => {
  return async (req, res, next) => {
    const resultError = [];
    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        resultError.push({ [key]: error.details });
      }
    }

    if (resultError.length > 0) {
      return res.status(400).json({ msg: "validation error", error: resultError });
    }

    next();
  };
};