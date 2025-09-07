"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esbuild_1 = require("esbuild");
const test_support_1 = require("test-support");
const _1 = __importDefault(require("."));
const slash_1 = __importDefault(require("slash"));
const path_1 = __importDefault(require("path"));
require('debug').enable(require('../package.json').name);
test('works', () => __awaiter(void 0, void 0, void 0, function* () {
    const { unlink, base, paths: [ENTRY, UTILS], } = yield test_support_1.writeFiles({
        'entry.ts': `import {x} from '@custom'; console.log(x);`,
        'utils.ts': `import mod from 'mod'; export const x = mod('x');`,
        'node_modules/mod/index.js': 'export default () => {}',
    });
    let called = 0;
    let resolved = [];
    const tsconfig = {
        baseUrl: '.',
        compilerOptions: { paths: { '@custom': [UTILS] } },
    };
    const res = yield esbuild_1.build({
        entryPoints: [ENTRY],
        write: false,
        format: 'esm',
        target: 'es2017',
        bundle: true,
        plugins: [
            _1.default({
                tsconfig,
                onResolved: (p) => {
                    called++;
                    resolved.push(p);
                },
            }),
        ],
    });
    expect(called).toBe(1);
    const expected = ['utils.ts'];
    expect(resolved.map((x) => slash_1.default(path_1.default.relative(base, x)))).toEqual(expected);
    unlink();
}));
//# sourceMappingURL=index.test.js.map