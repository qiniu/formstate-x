import path from 'path'
import { defineConfig } from 'dumi'

const repo = 'formstate-x'

export default defineConfig({
  title: repo,
  favicon: 'TODO',
  logo: 'TODO',
  outputPath: `dist/${repo}`,
  mode: 'site',
  hash: true,
  // Because of using GitHub Pages
  base: `/${repo}/`,
  publicPath: `/${repo}/`,
  navs: [
    null,
    {
      title: 'GitHub',
      path: 'https://github.com/qiniu/formstate-x',
    },
  ],
  alias: {
    'formstate-x': path.join(__dirname, 'src')
  },
  mfsu: {}
  // more config: https://d.umijs.org/config
})