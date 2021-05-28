#!/bin/bash
# 打 开发包
# eg sh ./deploy.sh
# 打 提测包
# eg: sh ./deploy.sh tag_name

dir_name="log-vis"
rm -rf $dir_name

# 打包命令
npm run build

# 复制 vendor 到 打包后的目录
cp -r ./dist ./$dir_name
cp -r ./public ./$dir_name/public

# 获取当前时间戳
now=`date +%Y%m%d%H%M`

# 判断是否有tag_name
if [ x$1 != x ]
then
    #...有参数
    package_name="${dir_name}-web-$1.tgz"
else
    #...没有参数
    package_name="${dir_name}-web-${now}.tgz"
fi

# 如果文件不存在，则创建文件夹
if [ ! -d "tgz" ]; then
  mkdir -p tgz
fi

# 压缩
tar -czvf tgz/$package_name $dir_name

rm -rf $dir_name

# node ./auto_deploy/index.js $package_name

echo "打包完成!"
# echo "可使用scp命令进行上传：scp tgz/${tar_name} deploy@192.168.90.69:/opt/workspace/front-cty"
