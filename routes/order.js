const { verify } = require("jsonwebtoken");
const Order = require("../models/Order");
const { verifyToken, verifyAuthorization, verifyAdmin } = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async (req,res) => {
    const newOrder = new Order(req.body);

    try{
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch(err){
        res.status(500).json(err);
    }
})

//UPDATE
router.put("/:id", verifyAdmin, async (req,res) => {
    try{
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(200).json(updatedOrder);
    } catch(err){
        res.status(500).json(err);
    }
})

//DELETE
router.delete("/:id", verifyAdmin, async (req,res) => {
    try{
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order has been deleted ...");
    } catch(err){
        res.status(500).json(err);
    }
})

//FIND
router.get("/find/:userId", verifyAuthorization, async (req, res) => {
    try{
        const order = await Order.findById({userId: req.params.id});
        res.status(200).json(order);
    } catch(err){
        res.status(500).json(err);
    }
})

//FIND ALL
router.get("/", verifyAdmin, async (req,res) => {
    try{
        const carts = await Order.find();
        res.status(200).json(carts);
    }catch(err){
        res.status(500).json(err);
    }
})

//MONTHLY INCOME
router.get("/income", verifyAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(date.setMonth(lastMonth - 1));
    try{
        const income = await User.aggregate([
            {
                $match : {createdAt: {$gte: previousMonth}}
            },
            {
                $project: {
                    month: {$month: "$createdAt"},
                    sales: "$amount"
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum: "$sales"}
                }
            }
        ])
        res.status(200).json(income);
    } catch(err){
        res.status(500).json(err);
    }
})

module.exports = router;
