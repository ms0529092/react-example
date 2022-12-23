
### 環境是development或production
    mode:'development',

### 設定進入點
    entry:{
        main:'./src/main.js' //從哪裡開始打包
    },

### 設定打包出來後的目錄
    output:{
        filename:'[name]-[hash:4].js',        //要打包後的檔名
        path: path.resolve(__dirname, 'dist') //要打包到哪裡
    },

### 打包壓縮最佳化設定
    optimization:{
        minimize:true,      //是否啟用最小化處理
        namedModules:false, //是否在輸出 bundle 中的模組加上名稱
        namedChunks:false,  //是否在輸出 Chunks 時的 ID 改為名稱            
        flagIncludedChunks:true, //是否加載大型chunks子集(在執行環境 production 下，該項會默認 true)
        removeEmptyChunks:true, //是否移除空白的chunk
        sideEffects:true,
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
    },

### 下面都在解析, 看到甚麼附檔名,用甚麼方式處裡
    module:{
        rules: [
            {
                test:/\.(js|jsx)$/,
                exclude:/node_modules/, //不編譯區域
                use:{
                    loader: 'babel-loader',
                    options:{
                        presets:['@babel/preset-react', '@babel/preset-env']
                    }
                }
            }
        ]
    },

### webpack-dev-server的設定
    devServer: {
        static:{
            directory: path.resolve(__dirname, 'dist') // 本來打包完的檔案位置(4.0.0版之後的設定方法)(如未設定將打包置public)
        },
        proxy:{         //建立代理伺服器
            '/api/web/**':{
                target:'http://202.133.245.190:8104/',  // 需要跨域的API地址
                pathRewrite: { '^/api': '' },           // 修改請求的API路径
                changeOrigin: true,                     // 是否讓target是域名
                secure: false,                          // 是否接受運行在HTTPS的安全協定上
                logLevel: 'debug',                      // log產生形式
            },

        },
        port:8787,      // 預覽網頁要跑在哪個port
        compress: true, // 我們所有的檔案壓縮變成 .gzip 的檔案(因為會有壓縮這個行為，所以就會吃一些資源)
        open: true,     // 是否要自動開啟瀏覽器
        hot: true       // 是否開啟熱更新(HMR (Hot Module Replacement)，透過啟用這個屬性，當我們修改 src 底下的資源時，也會同時更新模擬伺服器)
    },

### webpack 外掛套件
    plugins:[
          /** 用來生成 webpack 內可掌握的環境狀態  */
          new webpack.DefinePlugin({
              'process.env': {
                  NODE_ENV: JSON.stringify(argv.mode),
                  __VERSION__: JSON.stringify(require('./package.json').version),
              },
          }),

        /** webpack 客製化打包進度條樣式 */
        new ProgressBarWebpackPlugin(),


        /** webpack 打包時清除資料  */
         new CleanWebpackPlugin(
           {
             dry:false,                    //預設值 false，模擬刪除文件
             verbose:false,                //預設值 false，將日誌寫入控制台
             cleanStaleWebpackAssets:true, //預設值 true，在重新構建時自動刪除所有未使用的webpack資產
             protectWebpackAssets:true,    //預設值 true，不允許刪除當前的 webpack 資產

             // **警告**
             // 以下選項的注意事項：
        
             // 以下選項是不安全的......所以建議使用 dry: true 測試。
                
             // 相對於 webpack 的 output.path 目錄。
             // 如果在 webpack 的 output.path 目錄之外，
             // 使用完整路徑。 path.join(process.cwd(), 'build/**/*')
                
             // 這些選項擴展了 del 的模式匹配 API。
             // 見 https://github.com/sindresorhus/del#patterns
             // 用於模式匹配文檔
                

             cleanOnceBeforeBuildPatterns:['dist'],            //預設值 ['**/*']，在 Webpack 編譯之前，刪除指定文件，不包括在重建的相同文件（監視模式）
             cleanAfterEveryBuildPatterns:['dist'],            //預設值 []，在 Webpack 編譯之後，刪除指定文件(用於不是由 Webpack 直接創建的文件)
             dangerouslyAllowCleanPatternsOutsideProject:false //預設值 false，允許 process.cwd() 之外的乾淨模式
           }
         ),

        /** webpack 打包時使用html 模板生成 */
        new HtmlWebpackPlugin({
            title:'你ㄇㄇ知道你在這裡講幹話碼?',
            template:'./src/index.ejs',              // 用於生成的模板
            filename:'./index.html',                 // 生成後的檔名
            inject:true,                             // 注入所有的資源到特定的 template 或者 templateContent 中，* * 如果設置為 true 或者 body，所有的 javascript 資源將被放置到 body 元素的底部，’head’ 將放置到 head 元素中
            favicons：'',                            // 頁籤icon
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
    ],

### webpack 解析
    resolve:{
        modules:[path.resolve(__dirname, 'src'), 'node_modules'], //解析設定目錄下的模組 
        alias:{
            config:path.resolve(__dirname, './src/config/'),
            api:path.resolve(__dirname, './src/actions/api.js')   //解析路徑
        },
        extensions: ['.js', '.css', '.scss', '.json'],            //解析匯入模組格式(import 時可不寫附檔名)
        symlinks:false                                            //npm link 是否生效
    }
