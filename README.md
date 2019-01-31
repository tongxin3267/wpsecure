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

CREATE TABLE `pathModifyLogs` (
  `pathId` varchar(50) NOT NULL,
  `preGoodId` varchar(50) NOT NULL DEFAULT '',
  `preGoodName` varchar(50) NOT NULL DEFAULT '',
  `preGoodCount` int(11) NOT NULL DEFAULT '0',
  `goodCount` int(11) NOT NULL DEFAULT '0',
  `goodId` varchar(50) NOT NULL DEFAULT '',
  `goodName` varchar(50) NOT NULL DEFAULT '',
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `createdBy` varchar(50) DEFAULT '',
  `createdDate` datetime NOT NULL,
  `updatedDate` datetime NOT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `deletedBy` varchar(50) DEFAULT '',
  `deletedDate` datetime DEFAULT NULL,
  `version` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `shops` 
ADD COLUMN `isLocked` TINYINT(1) NOT NULL DEFAULT 0 AFTER `version`;

ALTER TABLE `pathModifyLogs` 
ADD COLUMN `sequence` INT(11) NOT NULL DEFAULT 0 AFTER `version`;

CREATE TABLE `orderDetailSnaps` (
  `orderDetailId` varchar(50) NOT NULL,
  `img` varchar(50) NOT NULL DEFAULT '',
  `_id` int(11) NOT NULL AUTO_INCREMENT,
  `createdBy` varchar(50) DEFAULT '',
  `createdDate` datetime NOT NULL,
  `updatedDate` datetime NOT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `deletedBy` varchar(50) DEFAULT '',
  `deletedDate` datetime DEFAULT NULL,
  `version` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

pathId to order detail

snap detailId

modify log

shoppath


