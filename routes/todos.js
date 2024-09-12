const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require('../config/connection');
var auth = require("../services/authentication");
const logger = require("../common/logger");
const { validatetodo } = require("../models/todo");


router.get('/', auth.authenticateToken, async (req, res) => {
    const signedin_user = res.locals.id;
    try {
        const connection = await pool;
        const [rows, fields] = await connection.query('SELECT * FROM todo where created_by = ?',[signedin_user]);
        res.json(rows);
    } catch (error) {
        logger.error('Error fetching todo:', error);
        res.status(500).json({ error: 'Error fetching todo' });
    }
});



router.post(
    "/create",
    auth.authenticateToken,
    async (req, res) => {
        const result = validatetodo(req.body);
        const r = req.body;
        const signedin_user = res.locals.id;
        const connection = await pool;

        if (result.error) {
            logger.error(`Create todo error is: ${result.error.details[0].message}`);
            res.status(400).json({ message: result.error.details[0].message });
            return;
        } else {

            try {
                query =
                    "INSERT INTO `todo`.`todo` (`title`, `due_date`, `priority`, `status`, `created_at`, `created_by`) VALUES (?, ?, ?, ?, now(), ?)";
                const [result] = await connection.query(query, [
                    r.title,
                    r.due_date,
                    r.priority,
                    r.status,
                    signedin_user
                ])

                logger.info("Create todo successfully by:", signedin_user);
                return res.status(200).json({ message: "Todo added successfully" });

            } catch (error) {
                logger.error("Create todo error is:", error);
                res.status(400).json({ message: error.message });
                return;
            }
        }
    }
);

module.exports = router;
