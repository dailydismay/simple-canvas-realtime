import * as joi from 'joi';

export const validate = (value: any, schema: joi.SchemaLike) =>
  new Promise((resolve, reject) =>
    joi.validate(value, schema, {}, err => (err ? reject(err) : resolve())),
  );
