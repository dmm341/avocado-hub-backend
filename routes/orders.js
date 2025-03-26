const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  CREATE NEW ORDER
 * ============================ */
router.post("/", (req, res) => {
  const { farmerId, numberOfFruits, pricePerFruit, totalAmount } = req.body;

  if (!farmerId || !numberOfFruits || !pricePerFruit || !totalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const fetchFarmerQuery = "SELECT name, total_fruits, total_money FROM farmers WHERE id = ?";
  db.query(fetchFarmerQuery, [farmerId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch farmer data." });

    if (results.length === 0) {
      return res.status(404).json({ message: "Farmer not found." });
    }

    const farmer = results[0];
    const customerName = farmer.name;

    const insertOrderQuery =
      "INSERT INTO orders (farmer_id, customer_name, number_of_fruits, price_per_fruit, total_amount) VALUES (?, ?, ?, ?, ?)";

    db.query(insertOrderQuery, [farmerId, customerName, numberOfFruits, pricePerFruit, totalAmount], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to record order." });

      const updateFarmerQuery =
        "UPDATE farmers SET total_fruits = total_fruits + ?, total_money = total_money + ? WHERE id = ?";

      db.query(updateFarmerQuery, [numberOfFruits, totalAmount, farmerId], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update farmer." });

        res.status(201).json({ message: "Order recorded and farmer updated!" });
      });
    });
  });
});
/** ============================
 *  UPDATE ORDER (EDIT)
 * ============================ */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { numberOfFruits, pricePerFruit, totalAmount } = req.body;

  if (!numberOfFruits || !pricePerFruit || !totalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch the existing order to calculate the difference
  const fetchOrderQuery = "SELECT farmer_id, number_of_fruits, total_amount FROM orders WHERE id = ?";
  db.query(fetchOrderQuery, [id], (err, orderResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch order." });

    if (orderResults.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    const existingOrder = orderResults[0];
    const farmerId = existingOrder.farmer_id;

    // Calculate the difference
    const fruitDifference = numberOfFruits - existingOrder.number_of_fruits;
    const moneyDifference = totalAmount - existingOrder.total_amount;

    // Update the order
    const updateOrderQuery = `
      UPDATE orders 
      SET number_of_fruits = ?, price_per_fruit = ?, total_amount = ?
      WHERE id = ?
    `;
    db.query(updateOrderQuery, [numberOfFruits, pricePerFruit, totalAmount, id], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update order." });

      // Update the farmer's total fruits and total money
      const updateFarmerQuery = `
        UPDATE farmers 
        SET total_fruits = total_fruits + ?, total_money = total_money + ?
        WHERE id = ?
      `;
      db.query(updateFarmerQuery, [fruitDifference, moneyDifference, farmerId], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update farmer." });

        res.status(200).json({ message: "Order and farmer updated successfully!" });
      });
    });
  });
});

/** ============================
 *  DELETE ORDER
 * ============================ */router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // First get the order details before deleting
  const getOrderQuery = "SELECT farmer_id, number_of_fruits, total_amount FROM orders WHERE id = ?";
  
  db.query(getOrderQuery, [id], (err, orderResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch order details." });
    
    if (orderResults.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    const order = orderResults[0];
    
    // Now delete the order
    const deleteQuery = "DELETE FROM orders WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete order." });

      // Update the farmer's totals by subtracting the order values
      const updateFarmerQuery = `
        UPDATE farmers 
        SET total_fruits = total_fruits - ?, 
            total_money = total_money - ?
        WHERE id = ?
      `;
      
      db.query(updateFarmerQuery, [order.number_of_fruits, order.total_amount, order.farmer_id], (err) => {
        if (err) return res.status(500).json({ message: "Order deleted but failed to update farmer totals." });
        
        res.status(200).json({ message: "Order deleted and farmer totals updated successfully!" });
      });
    });
  });
});

/** ============================
 *  GET ALL ORDERS
 * ============================ */
router.get("/", (req, res) => {
  const query = "SELECT * FROM orders ORDER BY order_date DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch orders." });
    res.json(results);
  });
});

module.exports = router;
