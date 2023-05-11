const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const fileName = 'bundle.js';

module.exports = async (env, argv) =>
{
    const target = env.target;

    const pathSrc = path.resolve(__dirname, './src');
    const pathDist = path.resolve(__dirname, `./_dist/${target}`);

    const isDev = argv.mode === 'development';

    const devServerConfig =
        {
            open : true,
            port : 'auto',
            hot  : false,

            static:
                [
                    {
                        directory : path.resolve(__dirname, './assets'),
                        watch     : true
                    },
                    {
                        directory : pathDist,
                        watch     : true
                    }
                ]
        };

    return ({
        entry: [`${pathSrc}/index.ts`],

        output:
            {
                path     : pathDist,
                filename : fileName,
                clean    : true
            },

        devtool: isDev ? 'source-map' : undefined,

        devServer: devServerConfig,

        module:
            {
                rules:
                [
                    {
                        test    : /\.(glsl|vert|frag)$/,
                        use     : 'ts-shader-loader',
                        exclude : /node_modules/
                    },

                    {
                        test: /\.tsx?$/,

                        use:
                            [
                                { loader: 'ts-loader' },
                                { loader: 'ifdef-loader', options: { IS_DEV: isDev } }
                            ],

                        exclude: /node_modules/
                    },

                    {
                        test: /\.jsx?$/,
                        use:
                            {
                                loader: 'babel-loader',

                                options:
                                    {
                                        cacheDirectory: false,

                                        presets:
                                            [
                                                '@babel/preset-env'
                                            ]
                                    }
                            }
                    }
                ]
            },

        resolve:
            {
                alias:
                    {
                        '@pixijs' : path.resolve(__dirname, './node_modules/pixi.js-legacy'),
                        '@spinejs': path.resolve(__dirname, './node_modules/pixi-spine')
                    },

                extensions: ['.ts', '.js'],

                modules: ['node_modules']
            },

        plugins:
            [
                new HtmlWebpackPlugin({
                    template : `${pathSrc}/template.html`,
                    inject   : false,
                    minify   : false,

                    templateParameters:
                        {
                            buildScript    : `<script src="${fileName}"></script>`
                        }
                }),

                // this should explicitly enable tree shaking
                new webpack.optimize.ModuleConcatenationPlugin(),

                new webpack.DefinePlugin({
                    VERSION      : JSON.stringify(pkg.version),
                    BUILD_TARGET : JSON.stringify(target)
                }),

                new CopyWebpackPlugin({
                    patterns:
                        [
                            { from: '**/**.*', context: 'assets' },
                            { from: '*.png', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.jpg', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.json', context: pathSrc, noErrorOnMissing: true },
                            { from: '*.php', context: pathSrc, noErrorOnMissing: true }
                        ],

                    options:
                        {
                            concurrency: 10
                        }
                })
            ],

        optimization:
            {
                concatenateModules: true,

                minimize: !isDev,

                minimizer:
                    [
                        new TerserWebpackPlugin({
                            test: /\.js(\?.*)?$/i,

                            terserOptions:
                                {
                                    ecma     : 5,
                                    warnings : false,
                                    parse    : {},
                                    compress:
                                        {
                                            drop_console: true
                                        },
                                    // mangle:
                                    //     {
                                    //         properties: { regex: /^_/ },
                                    //     },
                                    mangle          : true,
                                    module          : false,
                                    output          : null,
                                    toplevel        : false,
                                    nameCache       : null,
                                    ie8             : false,
                                    keep_classnames : undefined,
                                    keep_fnames     : false,
                                    safari10        : false
                                }
                        })
                    ]
            },

        performance: { hints: false }
    });
};
