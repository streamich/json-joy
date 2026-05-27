import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'Collaborative React',
  title: 'Collaborative React.js',
  type: 'lib',
  subtitle: 'React hooks, context, and components for binding UI to JSON CRDT models and nodes.',
  pkg: '@jsonjoy.com/collaborative-react',
  group: 'ui',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-react',
  tech: 'React.js',
  techIcon: {set: 'lineicons', icon: 'react'},
  showContentsTable: true,
  children: [
    {
      name: 'Context',
      subtitle: 'Share one CRDT document across the whole React tree.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./context.md')).default,
    },
    {
      name: 'Model hooks',
      subtitle: 'Subscribe to a Model: useModelView, useModel, useModelTry, useModelTick.',
      // @ts-ignore
      src: async () => (await import('./hooks-model.md')).default,
    },
    {
      name: 'Node hooks',
      subtitle: 'Subscribe to a NodeApi: useNode, useNodeView, useNodeChange, useNodeEffect, useNodeEvents.',
      // @ts-ignore
      src: async () => (await import('./hooks-node.md')).default,
    },
    {
      name: 'Path hooks',
      subtitle: 'Resolve nested nodes by path: usePath, usePathView, useObj, useArr, useStr.',
      // @ts-ignore
      src: async () => (await import('./hooks-path.md')).default,
    },
    {
      name: 'Components',
      subtitle: 'Render-prop components: UseModel and UseNode.',
      // @ts-ignore
      src: async () => (await import('./components.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
