# osal
## sales system

## steps
CREATE SCHEMA `wpsecure` DEFAULT CHARACTER SET utf8 ;

1. 先拿到所有部门，部门1的那个就是顶级部门
2. 根据顶级部门拿到所有员工
3. 根据员工手机号码跟上传信息进行对比
--- ignore all

1. 公司授权时自动添加，同时自动添加配置
2. 管理员不存在时自动添加 -- done
3. 企业微信扫码电脑登录
4. 过期了自动退出首页Id
5. 错误信息根据user独立显示

4. 只能看到自己上传的工资信息
5. 人员信息共享
6. 合同信息共享
7. 合同提醒设置
8. 隐患信息独立
9. crm独立


1. 隐患等级 一般 较大 重大 3个等级

开发注意事项
1. IP白名单在服务商处设置

ALTER TABLE `companys` 
ADD COLUMN `password` VARCHAR(50) NOT NULL DEFAULT '' AFTER `version`;

ALTER TABLE `systemConfigures` 
ADD COLUMN `suitId` VARCHAR(50) NOT NULL DEFAULT '' AFTER `version`;