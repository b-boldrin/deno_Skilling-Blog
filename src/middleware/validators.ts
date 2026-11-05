
import type { Request, Response, NextFunction } from 'express';
import { createRequire } from 'node:module';
import * as isness from '@zarco/isness';

const require = createRequire(import.meta.url);

const imported = require('request-check');

const requestCheck =
  typeof imported === 'function'
    ? imported
    : imported.default;

if (typeof requestCheck !== 'function') {
  throw new Error('Não foi possível carregar request-check');
}

const rc = requestCheck();

function isFilled(value : string | null | undefined): boolean {
  return value !== null &&
         value !== undefined &&
         isness.string(value) &&
         value.trim() !== '';
}

rc.requiredMessage = 'O campo :name é obrigatório';

rc.addRule('content', {
  validator: (value : string) => isFilled(value),
  message: 'O conteúdo da skill é obrigatório'
});


rc.addRule('title', {
  validator: (value : string) => isFilled(value),
  message: 'O título da skill é obrigatório'
});


rc.addRule('_id', {
  validator: (value : string) => isFilled(value),
  message: 'O identificador _id é obrigatório'
});



rc.addRule('tags', {
  validator: (value: unknown) => Array.isArray(value) && value.length > 0,
  message: 'As tags são obrigatórias'
});

rc.addRule('username', {
  validator: (value : string) => isness.fullName(value),
  message: 'O Username é obrigatório'
});

rc.addRule('email', {
  validator: (value : string) => isness.email(value),
  message: 'E-mail inválido'
});

export function validatorCreateSkill(req : Request, res : Response, next : NextFunction) {
  const {title, content, tags } = req.body;

    
    const errors = rc.check(
    {title},
    { content },
    { tags }
    );

  if (errors) {
    return next(res.err_badRequest('Erro de validação', errors));
  }

  next();
}

export function validatorDeleteSkill(req : Request, res : Response, next : NextFunction) {
  const { _id } = req.body;

    const errors = rc.check(
    { _id }
    );

  if (errors) {
    return next(res.err_badRequest('Erro de validação', errors));
  }

  next();
}

export function validatorCreateUser(req : Request, res : Response, next : NextFunction) {
  const { username, email } = req.body;
    
    const errors = rc.check(
    { username },
    { email }
    );

  if (errors) {
    return next(res.err_badRequest('Erro de validação', errors));
  }

  next();
}


