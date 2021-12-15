const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");
router.get('/',
    auth,
    async (req,res)=>{
        try{
            const user = await User.findById(req.user.id).select("-password");
            res.json(user);
        }catch (e) {
            res.status(500).send("Server Error");
        }
    });

module.exports = router;