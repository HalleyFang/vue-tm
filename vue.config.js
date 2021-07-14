module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/main/'
        : '/',
    devServer: {
        open: true,
        host: 'localhost',
        port: 8098,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8097', //源地址
                changeOrigin: true, //改变源
                pathRewrite: {
                    '^/api': '' //路径重写
                }
            }
        }
    },
    chainWebpack: config => {
        config.module
            .rule('image')
            .test(/\.ico$/)
            .use('url-loader')
            .loader('url-loader')
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    }
}