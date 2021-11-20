import path from 'path'
import { defineConfig } from 'dumi'

const repo = 'formstate-x'

export default defineConfig({
  title: repo,
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'dist',
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
    'formstate-x': path.join(__dirname, 'src'),
    'formstate-x/bindings/react': path.join(__dirname, 'src/bindings/react')
  },
  mfsu: {}
  // more config: https://d.umijs.org/config
})