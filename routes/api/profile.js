const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

router.get(
    '/me',
    auth,
    async (req,res) => {
       try{
           const profile = await Profile.findOne({ user: req.user.id })
               .populate("user", ["name, avatar"]);
           if(!profile){
               return res.status(400).json({ msg: "There is no profile"});
           }
       }catch (e) {
           console.error(e.message);
           res.status(500).send("Server Error");
       }
    });

router.post(
    '/',
    [
        auth,
        [
            check("status", "Status is required")
                .not().isEmpty(),
            check("skills", "Skills is require")
                .not().isEmpty()
        ]
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            location,
            bio,
            status,
            githubusername,
            website,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,

        } = req.body;

        const profileField = {};
        profileField.user = req.user.id;
        if(company) profileField.company = company;
        if(website) profileField.website = website;
        if(location) profileField.location = location;
        if(bio) profileField.bio = bio;
        if(status) profileField.status = status;
        if(githubusername) profileField.githubusername = githubusername;
        if(skills){
            profileField.skills = skills.split(",").map(skill => skill.trim());
        }

        profileField.social = {};
        if(youtube) profileField.youtube = youtube;
        if(twitter) profileField.twitter = twitter;
        if(facebook) profileField.facebook = facebook;
        if(linkedin) profileField.linkedin = linkedin;
        if(instagram) profileField.instagram = instagram;

        try{
            let profile = await Profile.findOne({ user: req.user.id });
            if(profile){
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileField },
                    { new: true }
                );
                return res.json(profile);
            }
            profile = new Profile(profileField);
            await profile.save();
            return res.json(profile);

        }catch (e) {
            console.error(e.message);
            res.status(500).send("Server Error");
        }
    });

module.exports = router;