const express = require("express");
const pool = require("../Models/dbConfig");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const cart = await pool.query(
            `
            SELECT O.OrderNo AS Order_No, R.Rest_Name As Restaurant, FI.ItemName, FI.Price, OC.Quantity 
            FROM ORDERS O, ORDER_CONTENTS OC, RESTAURANTS R, FOOD_ITEMS FI
            WHERE
                O.Cust_Uname = $1 AND 
                O.isPlaced = $2 AND 
                O.OrderNo = OC.OrderNo AND 
                OC.ItemNo = FI.ItemNo AND
                OC.FSSAI = FI.FSSAI AND 
                O.FSSAI = R.FSSAI
            `,
            [req.session.user.uname, false]
        );
        res.send(cart);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/", async (req, res) => {
    try {
        const cart = await pool.query("SELECT * FROM ORDERS WHERE Cust_Uname = $1 AND isPlaced = $2", [req.session.user.uname, false]);
        if(cart.rowCount)
            res.status(406).send("Cart is Empty");
        else {
            const order = await pool.query(
                "UPDATE ORDERS SET isPlaced = $1 WHERE OrderNo = $2 RETURNING *", 
                [true, cart.rows[0].orderno]
            );
            res.status(201).send(order); 
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.delete("/", async (req, res) => {
    try {
        const cart = await pool.query(
            "DELETE FROM ORDERS WHERE Cust_Uname = $1 AND isPlaced = $2",
            [req.session.user.uname, false]
        );
        res.send("Cart emptied");
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

let cart;
router.use((req, res, next) => {
    cart = await pool.query(
        "SELECT * FROM ORDERS WHERE Cust_Uname = $1 AND isPlaced = $2",
        [req.session.user.uname, false]
    );
    next();
})

router.post("/:item_no", async (req, res) => {
    try {
        if(!cart.rowCount) {
            cart = await pool.query(
                `
                INSERT INTO ORDERS (OrderTime, IsPlaced, IsAssigned, IsPrepared, IsReceived, IsDelivered, IsPaid, Cust_Uname, FSSAI) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `,
                [(new Date()).getTime(), false, false, false, false, false, false, req.session.user.uname, req.body.fssai]
            );
        }

        let item = await pool.query(
            "SELECT * FROM ORDER_CONTENTS WHERE OrderNo = $1 AND ItemNo = $2 AND FSSAI = $3",
            [cart.rows[0].orderno, req.params.item_no, req.body.fssai]
        );
        if(item.rowCount) {
            item = await pool.query(
                "UPDATE ORDER_CONTENTS SET Quantity = Quantity + 1 WHERE OrderNo = $1 AND ItemNo = $2 AND FSSAI = $3 RETURNING *",
                [cart.rows[0].orderno, req.params.item_no, req.body.fssai]
            );
        } else {
            item = await pool.query(
                "INSERT INTO ORDER_CONTENTS VALUES ($1, $2, $3, $4) RETURNING *",
                [cart.rows[0].orderno, req.params.item_no, req.body.fssai, 1]
            );
        }
        res.status(201).send(item);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.delete("/:item_no", async (req, res) => {
    try {
        if(!cart.rowCount)
            res.status(404).send("Cart is empty");
        else {
            const item = await pool.query(
                "DELETE FROM ORDER_CONTENTS WHERE OrderNo = $1 AND ItemNo = $2 AND FSSAI = $3",
                [cart.rows[0].orderno, req.params.item_no, req.body.fssai]
            )
            if(item.rowCount)
                res.send("Item removed");
            else
                res.status(404).send("Item not in cart");
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.patch("/:item_no", async (req, res) => {
    try {
        if(!cart.rowCount)
            res.status(404).send("Cart is empty");
        else {
            const item = await pool.query(
                "UPDATE ORDER_CONTENTS SET Quantity = $1 WHERE OrderNo = $2 AND ItemNo = $3 AND FSSAI = $4 RETURNING *",
                [req.body.quantity, cart.rows[0].orderno, req.params.item_no, req.body.fssai]
            );
            if(item.rowCount)
                res.send(item);
            else
                res.status(404).send("Item does not exist");
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;