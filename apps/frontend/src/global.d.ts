// apps/frontend/src/next-env-custom.d.ts

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}