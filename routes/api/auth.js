const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const {check, validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
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

router.post(
    '/',
    [
        check("email", "Valid email is required")
            .isEmail(),
        check("password", "Valid password is required")
            .exists()
    ],
    async (req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({ errors: [{msg: "User not exists"}] });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({ errors: [{msg: "Wrong password"}] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload,
                config.get("jwtSecret"),
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if(err) throw err;
                    res.json({ token });
                }
            );

        }catch (e) {
            console.error(e.message);
            return res.status(500).send("Server error");
        }
    });


module.exports = router;