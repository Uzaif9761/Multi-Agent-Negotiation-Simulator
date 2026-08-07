import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, './src/components'),
      'views': path.resolve(__dirname, './src/views'),
      'assets': path.resolve(__dirname, './src/assets'),
      'variables': path.resolve(__dirname, './src/variables'),
      'layouts': path.resolve(__dirname, './src/layouts'),
      'routes.js': path.resolve(__dirname, './src/routes.js'),
      'react-is': path.resolve(__dirname, './src/mock-react-is.js')
    }
  }
})
