# osal
## sales system

## steps
1. 创建message template
2. 创建支付认证等等信息
3. accesstoken 需要独立出来

CREATE SCHEMA `wposal` DEFAULT CHARACTER SET utf8 ;

ALTER TABLE `siteInfos` 
ADD COLUMN `bgImg` VARCHAR(50) NOT NULL DEFAULT '' AFTER `version`,
ADD COLUMN `advImg` VARCHAR(50) NOT NULL DEFAULT '' AFTER `bgImg`,
ADD COLUMN `advideo` VARCHAR(50) NOT NULL DEFAULT '' AFTER `advImg`;