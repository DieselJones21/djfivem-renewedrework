CREATE TABLE IF NOT EXISTS `bank_accounts_new` (
  `id` varchar(50) NOT NULL,
  `amount` int(11) DEFAULT 0,
  `transactions` longtext DEFAULT '[]',
  `auth` longtext DEFAULT '[]',
  `isFrozen` int(11) DEFAULT 0,
  `creator` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `player_transactions` (
  `id` varchar(50) NOT NULL,
  `isFrozen` int(11) DEFAULT 0,
  `transactions` longtext DEFAULT '[]',
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `bank_loans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(50) NOT NULL,
  `account_type` varchar(20) NOT NULL,
  `account_name` varchar(80) DEFAULT NULL,
  `applicant_cid` varchar(50) NOT NULL,
  `applicant_name` varchar(80) NOT NULL,
  `amount` int(11) NOT NULL,
  `interest` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `remaining` int(11) NOT NULL,
  `term_days` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT '',
  `status` varchar(30) NOT NULL,
  `banker_cid` varchar(50) DEFAULT NULL,
  `banker_name` varchar(80) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `decided_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
