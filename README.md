# osal
## sales system

## steps
CREATE SCHEMA `wpsecure` DEFAULT CHARACTER SET utf8 ;

1. 先拿到所有部门，部门1的那个就是顶级部门
2. 根据顶级部门拿到所有员工
3. 根据员工手机号码跟上传信息进行对比


1. 隐患等级 一般 较大 重大 3个等级

ALTER TABLE `companys` 
ADD COLUMN `peoplePassword` VARCHAR(50) NOT NULL DEFAULT '' AFTER `version`;
