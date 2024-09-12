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

router.get('/dashboardcount/:cdate', auth.authenticateToken, async (req, res) => {
    const cdate = req.params.cdate;
    const signedin_user = res.locals.id;
    try {
        const connection = await pool;
        const [rows, fields] = await connection.query("SELECT (SELECT count(t.id) from todo t where created_by = ? and priority = 'Low') as low_todo, (SELECT count(t.id) from todo t where created_by = ? and priority = 'Medium') as medium_todo, (SELECT count(t.id) from todo t where created_by = ? and priority = 'High') as high_todo, (SELECT count(t.id) from todo t where created_by = ? and status = 'Complete') as complete_todo, (SELECT count(t.id) from todo t where created_by = ? and status <> 'Complete' and date(due_date) < ?) as passed_duedate_todo",[signedin_user,signedin_user,signedin_user,signedin_user,signedin_user, cdate]);
        res.json(rows);
    } catch (error) {
        logger.error('Error fetching dashboardcount:', error);
        res.status(500).json({ error: 'Error fetching dashboardcount' });
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

router.delete("/:id", auth.authenticateToken, async (req, res) => {
    const todo_id = req.params.id;
    let connection = await pool.getConnection();

    try {
        deleteQuery =
            "delete from `todo` where id = ?"
        const [deleteResult] = await connection.query(deleteQuery, [todo_id]);
        // Send a success response
        logger.info("Todo deleted successfully");
        return res.status(200).json({ message: "Todo delete successfully" });
    } catch (error) {
        // Log the original error and send an error response
        logger.error("delete todo error is:", error);
        return res.status(400).json({ message: error.message });
    }
})


router.put(
    "/:id",
    auth.authenticateToken,
    async (req, res) => {
        const signedin_user = res.locals.id;
        const todo_id = req.params.id;
        const r = req.body;
        let connection = await pool.getConnection();
        try {
            query =
                "UPDATE `todo` SET `title` = ?, `due_date` = ?, `priority` = ?, `updated_at` = now(), `updated_by` = ? WHERE (`id` = ?)";

            const [result] = await connection.query(query, [
                r.title,
                r.due_date,
                r.priority,
                signedin_user,
                todo_id
            ]);
            logger.info("Todo updatad successfully");
            return res.status(200).json({ message: "Todo updated successfully" });

        } catch (error) {
            // Log the original error and send an error response
            logger.error("Todo update error is:", error);
            return res.status(400).json({ message: error.message });

        }
    }

);

router.put(
    "/status/:id",
    auth.authenticateToken,
    async (req, res) => {
        const signedin_user = res.locals.id;
        const todo_id = req.params.id;
        const r = req.body;
        let connection = await pool.getConnection();
        try {
            query =
                "UPDATE `todo` SET `status` = ?, `updated_at` = now(), `updated_by` = ? WHERE (`id` = ?)";

            const [result] = await connection.query(query, [
                r.status,
                signedin_user,
                todo_id
            ]);
            logger.info("Todo Status updatad successfully");
            return res.status(200).json({ message: "Todo Status updated successfully" });

        } catch (error) {
            // Log the original error and send an error response
            logger.error("Todo Status update error is:", error);
            return res.status(400).json({ message: error.message });

        }
    }

);


module.exports = router;
