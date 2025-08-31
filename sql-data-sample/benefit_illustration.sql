-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 06:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `benefit_illustration`
--

-- --------------------------------------------------------

--
-- Table structure for table `illustrations`
--

CREATE TABLE `illustrations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `policy_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `year` int(11) NOT NULL,
  `age` int(11) NOT NULL,
  `premium_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cumulative_premium` decimal(12,2) NOT NULL DEFAULT 0.00,
  `guaranteed_addition` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cumulative_guaranteed_addition` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_benefit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `surrender_value` decimal(12,2) DEFAULT 0.00,
  `death_benefit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `policies`
--

CREATE TABLE `policies` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sum_assured` decimal(12,2) NOT NULL,
  `modal_premium` decimal(10,2) NOT NULL,
  `premium_frequency` enum('Yearly','Half-Yearly','Monthly') NOT NULL DEFAULT 'Yearly',
  `policy_term` int(11) NOT NULL,
  `premium_paying_term` int(11) NOT NULL,
  `annual_premium` decimal(10,2) DEFAULT NULL,
  `calculated_age` int(11) DEFAULT NULL,
  `policy_status` enum('Draft','Active','Matured','Lapsed') DEFAULT 'Draft',
  `calculation_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name_hash` varchar(255) NOT NULL COMMENT 'Hashed version of user name for security',
  `dob_encrypted` text NOT NULL COMMENT 'Encrypted date of birth',
  `mobile_hash` varchar(255) NOT NULL COMMENT 'Hashed mobile number',
  `gender` enum('M','F','Other') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name_hash`, `dob_encrypted`, `mobile_hash`, `gender`, `is_active`, `created_at`, `updated_at`) VALUES
('599465e9-37e4-4ccb-9274-f007e36fb4b3', 'john.doe@example.com', '$2b$10$7OUOn61NcNYkiKAfgTwrfuzPM4H8QjUClY/Y0zCl5iMtaw.twurY6', '$2b$10$pFhrxQl9WrCdwY86CZhCneXRaFwGGHKiNFRYCYeCJIaQ5PR9NfMYm', '933d3b96badd1650a612dbb6e5272019:6207410f1cb69707ed26e5f74b8137fe', '$2b$10$dRmTQcxJBrwmht9eGKqHHeuH./7T9lGmtxjGzY9T75.eUTlHCgTwu', 'M', 1, '2025-08-31 15:08:51', '2025-08-31 15:08:51'),
('765574fb-8e97-4eee-9add-ddd77379c1e6', 'jane.smith@example.com', '$2b$10$y47FLxrU10jGp0q7r8HJsel/jSLzZ3gF/h9STiAvsj1Qj7NQxZ7c2', '$2b$10$6qBYj8z.0TE85RzGLxG2sepbeXvZYJAfaQanrq8IpiKdZtHSj9jH6', 'b9e763a9c49e076094e513ec842d2496:697e04a01f9d79ac70202ed88eacbb87', '$2b$10$blkh4OdeQS3sOwbcb.nPyeylv.zTMdcArJg2ZFwWYviSHtzjQnJwO', 'F', 1, '2025-08-31 15:08:51', '2025-08-31 15:08:51'),
('a3ad0096-ce57-42f4-b7f8-fe4653275ab5', 'admin@valueenable.com', '$2b$10$08bHfamTsPqNj9mbIj1dk.STi/CbZXYC30LXX.HpdDeJKaycS8dgW', '$2b$10$2fNWbnnXaCVRzi63s3yrleclJca.C8ogCPnAq3z6Ohe4fi64BkFxq', 'a419c5b99eb2cb0e321a2d04171dc336:d736c3f54e447bcba740ded96909a4c1', '$2b$10$48mZQmZAwJ7b9yTz9kHnY.aZC33jcbatexdgSwxmEi9/qxV6w5FjW', 'M', 1, '2025-08-31 15:08:52', '2025-08-31 15:08:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `illustrations`
--
ALTER TABLE `illustrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `illustrations_policy_id_year` (`policy_id`,`year`),
  ADD KEY `illustrations_policy_id` (`policy_id`),
  ADD KEY `illustrations_year` (`year`);

--
-- Indexes for table `policies`
--
ALTER TABLE `policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `policies_user_id` (`user_id`),
  ADD KEY `policies_policy_status` (`policy_status`),
  ADD KEY `policies_calculation_date` (`calculation_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `users_email` (`email`),
  ADD KEY `users_name_hash` (`name_hash`),
  ADD KEY `users_mobile_hash` (`mobile_hash`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `illustrations`
--
ALTER TABLE `illustrations`
  ADD CONSTRAINT `illustrations_ibfk_1` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `policies`
--
ALTER TABLE `policies`
  ADD CONSTRAINT `policies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
