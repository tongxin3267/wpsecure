# cha
## sales system

ALTER TABLE `wpcha2`.`ws_users` 
ADD COLUMN `uname` varchar(40) NOT NULL DEFAULT '' AFTER `wxId`,
ADD COLUMN `ugender` tinyint(1) NOT NULL DEFAULT '0' AFTER `uname`,
ADD COLUMN `uavatar` varchar(256) NOT NULL DEFAULT '' AFTER `ugender`,
ADD COLUMN `skey` varchar(128) NOT NULL DEFAULT '' AFTER `uavatar`,
ADD COLUMN `sessionkey` varchar(128) NOT NULL DEFAULT '' AFTER `skey`;

CREATE TABLE `systemConfigures` (
  `name` varchar(50) NOT NULL,
  `value` varchar(250) NOT NULL DEFAULT '',
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `createdBy` varchar(50) DEFAULT '',
  `createdDate` datetime NOT NULL,
  `updatedDate` datetime NOT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `deletedBy` varchar(50) DEFAULT '',
  `deletedDate` datetime DEFAULT NULL,
  `version` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

INSERT INTO `systemConfigures` (`name`,`value`, `createdDate`,`updatedDate`) VALUES ('access_token','','2018-12-20 13:25:38','2018-12-20 13:25:38');
## steps
1. 创建message template
2. 创建支付认证等等信息
3. 
