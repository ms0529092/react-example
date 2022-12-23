const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin') //webpack 打包最小化工具
const HtmlWebpackPlugin = require('html-webpack-plugin');  //webpack 打包時使用html 模板生成
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //webpack 打包時清除資料


const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin');  //webpack 客製化打包進度條樣式
const WebpackBundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; //webpack 打包詳細資訊訊


const path = require('path');


const config = (env, argv) => {
     /** 判斷執行環境是否為 development 或 production */
    const isDev = argv.mode == 'development';

    /** 打包壓縮最佳化設定 */
    const optimization = {
        minimize:true,      //是否啟用最小化處理
        //namedModules:false, //是否在輸出 bundle 中的模組加上名稱
        //namedChunks:false,  //是否在輸出 Chunks 時的 ID 改為名稱        
        flagIncludedChunks:true, //是否加載大型chunks子集(在執行環境 production 下，該項會默認 true)
        removeEmptyChunks:true, //是否移除空白的chunk
        splitChunks:{
            chunks:'all',
            cacheGroups:{
                reactVendor:{
                    test:/[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name:'reactVendor',
                }
            }
        },
        minimizer:[
            new TerserWebpackPlugin({
                extractComments: true,
                parallel: true,
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    compress: {
                        drop_console: true,
                    },
                }
            })
        ]
    }

    /** 解析模組的設定 */
    const module = {
        rules:[
            {
                test:/\.(js|jsx)$/,
                exclude:/node_modules/,
                use:{
                    loader: 'babel-loader',
                    options:{
                        presets:['@babel/preset-react', '@babel/preset-env']
                    }
                }
            },
            {
                test:/\.(css|scss|sass)\$/,
                use:[
                    {
                        loader:'style-loader'
                    },
                    {
                        loader:'css-loader'
                    },
                    {
                        loader:'postcss-loader',
                        options:{
                            plugins:()=> [require('autoprefixer')]
                        }
                    },
                    {
                        loader:'sass-loader'
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2|mp3|wav|csv|xlsx)$/,
                loader: 'url-loader',
                options: {
                    limit: 30000,
                    name: 'assets/[name].[ext]',
                },
            },
        ]
    }

    /** webpack-dev-server的設定 */
    const devServer = {
        static:{
            directory: path.resolve(__dirname, 'dist') // 本來打包完的檔案位置(4.0.0版之後的設定方法)(如未設定將打包置public)
        },
        port:8787,      // 預覽網頁要跑在哪個port
        compress: true, // 我們所有的檔案壓縮變成 .gzip 的檔案(因為會有壓縮這個行為，所以就會吃一些資源)
        open: true,     // 是否要自動開啟瀏覽器
        hot: true       // 是否開啟熱更新(HMR (Hot Module Replacement)，透過啟用這個屬性，當我們修改 src 底下的資源時，也會同時更新模擬伺服器)
    }

    /** webpack外掛組件的設定 */
    const plugins = [
        /** 用來生成 webpack 內可掌握的環境狀態的變數  */
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(argv.mode),
                __VERSION__: JSON.stringify(require('./package.json').version),
            },
        }),

        /** webpack 客製化打包進度條樣式 */
        new ProgressBarWebpackPlugin(),

        /** webpack 打包時清除資料  */
        new CleanWebpackPlugin(),

        /** webpack 打包時使用html 模板生成 */
        new HtmlWebpackPlugin({
            title:'你ㄇㄇ知道你在這裡講幹話碼?',
            template:'./src/index.ejs',              // 用於生成的模板
            filename:'./index.html',                 // 生成後的檔名
            inject:true,                             // 注入所有的資源到特定的 template 或者 templateContent 中，* * 如果設置為 true 或者 body，所有的 javascript 資源將被放置到 body 元素的底部，’head’ 將放置到 head 元素中
            //favicons：'',                          // 頁籤icon
            hash:true,                               // 如果為 true, 將添加一個唯一的 webpack 編譯 hash 到所有包含的腳本和 CSS 文件，對於解除 cache 很有用
            cache:true,                              // 默認值為 true，在文件修改之後才會發佈文件
            minify:{                                 // 壓縮並優化 HTML
                collapseWhitespace: true,            // 預設值 false，是否去掉註解
                removeComments: true,                // 預設值 false，是否去掉空格
                removeRedundantAttributes: true,     // 删除<script>的type="text/javascript"
                removeScriptTypeAttributes: true,    // 删除script的类型属性，在h5下面script的type默认值：text/javascript
                removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
            }
        }),
    ]

    /** webpack 匯入解析設定 */
    const resolve = {
        modules:[path.resolve(__dirname, 'src'), 'node_modules'], //解析設定目錄下的模組 
        alias:{
            config:path.resolve(__dirname, './src/config/'),
            api:path.resolve(__dirname, './src/actions/api.js')   //解析路徑
        },
        extensions: ['.js', '.css', '.scss', '.json'],  //解析匯入模組格式(import 時可不寫附檔名)
        symlinks:false  //npm link 是否生效
    }

    if(process.env.ANALYZE){
        plugins.push(new WebpackBundleAnalyzerPlugin());
    }
    
    return {
        /** 環境是development或production */
        mode:isDev ? 'development' : 'production',

        /** 設定進入點 */
        entry:{
            main:['@babel/polyfill', path.resolve(__dirname, './src/main.js')] //從哪裡開始打包
        },

        /** 設定打包出來後的目錄 */
        output:{
            filename:'[name]-[hash:4].js',  //要打包後的檔名
            path: path.resolve(__dirname, 'dist')   //要打包到哪裡
        },

        /** 打包壓縮最佳化 */
        optimization,

        /** 生成SourceMap */
        devtool: isDev && 'eval-cheap-module-source-map',
        
        /** 解析模組, 看到甚麼附檔名,用甚麼方式處裡 */
        module,

        /** webpack-dev-server */
        devServer,

        /** webpack外掛套件 */
        plugins,

        /** webpack 匯入解析 */
        resolve,
    }
}

module.exports = config;