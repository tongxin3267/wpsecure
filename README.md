# cha
## sales system

ALTER TABLE `wpcha2`.`ws_users` 
ADD COLUMN `uname` varchar(40) NOT NULL DEFAULT '' AFTER `wxId`,
ADD COLUMN `ugender` tinyint(1) NOT NULL DEFAULT '0' AFTER `uname`,
ADD COLUMN `uavatar` varchar(256) NOT NULL DEFAULT '' AFTER `ugender`,
ADD COLUMN `skey` varchar(128) NOT NULL DEFAULT '' AFTER `uavatar`,
ADD COLUMN `sessionkey` varchar(128) NOT NULL DEFAULT '' AFTER `skey`;
