
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


rc.addRule('tags', {
  validator: (value: unknown) => Array.isArray(value) && value.length > 0,
  message: 'As tags são obrigatórias'
});

rc.addRule('name', {
  validator: (value : string) => isness.fullName(value),
  message: 'O Nome é obrigatório'
});

rc.addRule('email', {
  validator: (value : string) => isness.email(value),
  message: 'E-mail inválido'
});





export default function validateRequest(req : Request, res : Response, next : NextFunction) {
  const { content, tags } = req.body;

    
    const errors = rc.check(
    { content },
    { tags }
    );

  if (errors) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  next();
}

