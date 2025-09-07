import { Plugin } from 'esbuild';
interface Options {
    name?: string;
    absolute?: boolean;
    tsconfig?: Tsconfig | string;
    onResolved?: (resolved: string) => any;
}
interface Tsconfig {
    baseUrl?: string;
    compilerOptions?: {
        paths?: Record<string, string[]>;
    };
}
export declare function TsconfigPathsPlugin({ name, absolute, onResolved, tsconfig, }: Options): Plugin;
export default TsconfigPathsPlugin;
//# sourceMappingURL=index.d.ts.map