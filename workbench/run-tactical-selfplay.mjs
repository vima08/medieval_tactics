import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context); } catch {}
      try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
    }
    return nextResolve(specifier, context);
  },
});

await import(process.argv[2] === 'scenarios' ? './tactical-scenarios.ts' : './tactical-selfplay.ts');
