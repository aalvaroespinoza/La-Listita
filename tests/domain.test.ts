import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,field,emojiFor} from '../worker/domain.ts';
test('normaliza nombres sin perder diferencias entre productos',()=>{assert.equal(normalize('  CAFÉ   molido '),'cafe molido');assert.notEqual(normalize('leche entera'),normalize('leche descremada'));});
test('valida límites y tipos en el servidor',()=>{assert.throws(()=>field({},80));assert.throws(()=>field('  ',80,true));assert.throws(()=>field('a'.repeat(81),80));assert.equal(field('  2 litros ',40),'2 litros');});
test('emoji conocido y alternativa',()=>{assert.equal(emojiFor('Café'),'☕');assert.equal(emojiFor('Producto nuevo'),'🛒');});
