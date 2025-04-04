const express = require("express");
const db = require("../config/db");
const router = express.Router();

/** ============================
 *  CREATE NEW SALE
 * ============================ */
router.post("/", (req, res) => {
  const { buyerId, avocadoType, customerName, numberOfFruits, pricePerFruit, totalAmount } = req.body;

  if (!buyerId || !avocadoType || !numberOfFruits || !pricePerFruit || !totalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const insertSaleQuery = `
    INSERT INTO sales 
    (buyer_id, avocado_type, customer_name, number_of_fruits, price_per_fruit, total_amount) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(insertSaleQuery, 
    [buyerId, avocadoType, customerName, numberOfFruits, pricePerFruit, totalAmount], 
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to record sale." });

      const updateField = avocadoType.toLowerCase(); // 'hass' or 'fuerte'
      const updateBuyerQuery = `
        UPDATE buyers 
        SET ${updateField}_fruits = ${updateField}_fruits + ?, 
            ${updateField}_money = ${updateField}_money + ?, 
            total_fruits = total_fruits + ?,
            total_money = total_money + ?
        WHERE id = ?
      `;

      db.query(updateBuyerQuery, 
        [numberOfFruits, totalAmount, numberOfFruits, totalAmount, buyerId], 
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to update buyer." });
          res.status(201).json({ message: "Sale recorded and buyer updated!" });
        }
      );
    }
  );
});

/** ============================
 *  UPDATE SALE (EDIT)
 * ============================ */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { numberOfFruits, pricePerFruit, totalAmount } = req.body;

  if (!numberOfFruits || !pricePerFruit || !totalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch the existing sale including avocado_type
  const fetchSaleQuery = "SELECT buyer_id, avocado_type, number_of_fruits, total_amount FROM sales WHERE id = ?";
  db.query(fetchSaleQuery, [id], (err, saleResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sale." });

    if (saleResults.length === 0) {
      return res.status(404).json({ message: "Sale not found." });
    }

    const existingSale = saleResults[0];
    const buyerId = existingSale.buyer_id;
    const updateField = existingSale.avocado_type.toLowerCase();

    // Calculate the difference
    const fruitDifference = numberOfFruits - existingSale.number_of_fruits;
    const moneyDifference = totalAmount - existingSale.total_amount;

    // Update the sale
    const updateSaleQuery = `
      UPDATE sales 
      SET number_of_fruits = ?, price_per_fruit = ?, total_amount = ?
      WHERE id = ?
    `;
    
    db.query(updateSaleQuery, [numberOfFruits, pricePerFruit, totalAmount, id], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update sale." });

      // Update the buyer's totals
      const updateBuyerQuery = `
        UPDATE buyers 
        SET ${updateField}_fruits = ${updateField}_fruits + ?, 
            ${updateField}_money = ${updateField}_money + ?,
            total_fruits = total_fruits + ?,
            total_money = total_money + ?
        WHERE id = ?
      `;
      
      db.query(updateBuyerQuery, 
        [fruitDifference, moneyDifference, fruitDifference, moneyDifference, buyerId], 
        (err) => {
          if (err) return res.status(500).json({ message: "Failed to update buyer." });
          res.status(200).json({ message: "Sale and buyer updated successfully!" });
        }
      );
    });
  });
});

/** ============================
 *  DELETE SALE
 * ============================ */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Get the sale details including avocado_type
  const getSaleQuery = `
    SELECT buyer_id, avocado_type, number_of_fruits, total_amount 
    FROM sales WHERE id = ?
  `;
  
  db.query(getSaleQuery, [id], (err, saleResults) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sale details." });
    
    if (saleResults.length === 0) {
      return res.status(404).json({ message: "Sale not found." });
    }

    const sale = saleResults[0];
    const updateField = sale.avocado_type.toLowerCase();
    
    // Delete the sale
    const deleteQuery = "DELETE FROM sales WHERE id = ?";
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete sale." });

      // Update the buyer's totals
      const updateBuyerQuery = `
        UPDATE buyers 
        SET ${updateField}_fruits = ${updateField}_fruits - ?, 
            ${updateField}_money = ${updateField}_money - ?,
            total_fruits = total_fruits - ?,
            total_money = total_money - ?
        WHERE id = ?
      `;
      
      db.query(updateBuyerQuery, 
        [sale.number_of_fruits, sale.total_amount, sale.number_of_fruits, sale.total_amount, sale.buyer_id], 
        (err) => {
          if (err) return res.status(500).json({ 
            message: "Sale deleted but failed to update buyer totals." 
          });
          
          res.status(200).json({ 
            message: "Sale deleted and buyer totals updated successfully!" 
          });
        }
      );
    });
  });
});

/** ============================
 *  GET ALL SALES
 * ============================ */
router.get("/", (req, res) => {
  const query = "SELECT * FROM sales ORDER BY sale_date DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch sales." });
    res.json(results);
  });
});

module.exports = router;