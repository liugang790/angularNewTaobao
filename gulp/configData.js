var dir          = require('./config/dir');
var common       = require('./config/common');
var superManager = require('./config/superManager');

module.exports = {
    dir: dir,

    // 公共配置
    common: common,

    // 各应用差异配置
    apps: {
        // 全功能应用配置
        superManager  : superManager
    }
};
