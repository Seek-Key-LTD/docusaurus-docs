import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '知识库概览',
      items: ['intro'],
    },
    {
      type: 'category',
      label: '智能体聚合通道',
      items: ['agent-routes'],
    },
  ],
};

export default sidebars;
