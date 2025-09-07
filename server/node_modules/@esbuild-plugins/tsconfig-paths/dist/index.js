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
exports.TsconfigPathsPlugin = void 0;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = require("typescript");
const find_up_1 = __importDefault(require("find-up"));
const strip_json_comments_1 = __importDefault(require("strip-json-comments"));
const NAME = 'tsconfig-paths';
const debug = require('debug')(NAME);
function TsconfigPathsPlugin({ name = NAME, absolute = true, onResolved, tsconfig, }) {
    debug('setup');
    const compilerOptions = loadCompilerOptions(tsconfig);
    return {
        name,
        setup: function setup({ onResolve }) {
            onResolve({ filter: /.*/ }, (args) => __awaiter(this, void 0, void 0, function* () {
                const hasMatchingPath = Object.keys((compilerOptions === null || compilerOptions === void 0 ? void 0 : compilerOptions.paths) || {}).some((path) => new RegExp(path.replace('*', '\\w*')).test(args.path));
                if (!hasMatchingPath) {
                    return null;
                }
                const { resolvedModule } = typescript_1.nodeModuleNameResolver(args.path, args.importer, compilerOptions || {}, typescript_1.sys);
                if (!resolvedModule) {
                    return null;
                }
                const { resolvedFileName } = resolvedModule;
                if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
                    return null;
                }
                let resolved = absolute
                    ? typescript_1.sys.resolvePath(resolvedFileName)
                    : resolvedFileName;
                if (onResolved) {
                    onResolved(resolved);
                }
                return {
                    path: resolved,
                };
            }));
        },
    };
}
exports.TsconfigPathsPlugin = TsconfigPathsPlugin;
function loadJSON(p) {
    try {
        let data = fs_1.default.readFileSync(p).toString();
        data = strip_json_comments_1.default(data);
        return JSON.parse(data);
    }
    catch (e) {
        throw new Error(`Cannot load json for '${p}'`);
    }
}
function loadCompilerOptions(tsconfig) {
    if (!tsconfig) {
        const configPath = find_up_1.default.sync(['tsconfig.json', 'jsconfig.json']);
        if (configPath) {
            const config = loadJSON(configPath);
            return config['compilerOptions'] || {};
        }
    }
    if (typeof tsconfig === 'string') {
        if (fs_1.default.existsSync(tsconfig)) {
            const config = loadJSON(tsconfig);
            return config['compilerOptions'] || {};
        }
    }
    if (tsconfig && tsconfig['compilerOptions']) {
        return tsconfig['compilerOptions'];
    }
    return {};
}
exports.default = TsconfigPathsPlugin;
//# sourceMappingURL=index.js.map