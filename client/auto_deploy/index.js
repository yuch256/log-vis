const path = require("path")
const fs = require("fs")
const { NodeSSH } = require("node-ssh")
const default_config = require(`./default_config`)
const ssh = new NodeSSH()

const args = process.argv;
const package_name = args.splice(2)[0];
const target_file = package_name || default_config.target_file

const deploy = () => {
    ssh.connect({
        host: default_config.host,
        port: default_config.port,
        username: default_config.username,
        password: default_config.password,
    }).then(() => {
        ssh.putFile(`./tgz/${target_file}`, default_config.path + target_file).then(status => {
            console.log('上传文件成功');
            console.log('开始执行远端脚本');

            ssh.execCommand(`tar -xzvf ${target_file}`, { cwd: default_config.path }).then(result => {
                console.log('远程STDOUT输出: ' + result.stdout)
                console.log('远程STDERR输出: ' + result.stderr)
                if (!result.stderr) {
                    console.log('解压成功!');
                } else {
                    console.log('解压失败!');
                }
            }).catch(e => {
                console.log('执行脚本失败:', e);
                process.exit(0);
            })
        }).catch(e => {
            console.log('文件上传失败:', e);
            process.exit(0);
        })
    }).catch(e => {
        console.log('ssh连接失败:', e);
        process.exit(0);
    })
}

deploy()