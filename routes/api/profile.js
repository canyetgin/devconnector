const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
router.get(
    '/me',
    auth,
    async (req,res) => {
       try{
           const profile = await Profile.findOne({ user: req.user.id })
               .populate("user", ["avatar","name"]);
           if(!profile){
               return res.status(400).json({ msg: "There is no profile"});
           }
           return res.json(profile);
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

router.get(
    '/',
    async (req,res) => {
        try{
            const profiles = await Profile.find()
                .populate("user", ["name", "avatar"]);

            return res.json(profiles);

        }catch (e) {
            console.error(e.message);
            res.status(500).send("Server Error");
        }
    });

router.get(
    '/user/:user_id',
    async (req,res) => {
        try{
            const profile = await Profile.findOne({ user: req.params.user_id })
                .populate("user", ["name", "avatar"]);
            if(!profile) return res.status(400).json({ msg: "Profile not found" });
            return res.json(profile);

        }catch (e) {
            console.error(e.message);
            if(e.kind === "ObjectId") return res.status(400).json({ msg: "Profile not found" });
            res.status(500).send("Server Error");
        }
    });

router.delete(
    '/',
    auth,
    async (req,res) => {
        try{
            await Profile.findOneAndRemove({ user: req.user.id });
            await User.findOneAndRemove({ _id: req.user.id });
            return res.json({ msg: "User deleted" });

        }catch (e) {
            console.error(e.message);
            res.status(500).send("Server Error");
        }
    });

router.put(
  "/experience",
  [
      auth,
      [
          check("title", "Title is required")
              .not()
              .isEmpty(),
          check("company", "Company is required")
              .not()
              .isEmpty(),
          check("from", "From date is required")
              .not()
              .isEmpty(),
      ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const{
        title,
        company,
        location,
        from,
        to,
        current,
        desc
    }= req.body;

    const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            desc
    }

    try{
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        return res.json(profile);
    }catch (e) {
        console.error(e.message);
        res.status(500).send("Server Error");
    }

  }
);

router.delete(
    "/experience/:exp_id",
    auth,
    async (req, res) => {
        try{
            const profile = await Profile.findOne({ user: req.user.id });
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex, 1);
            await profile.save();

        }catch (e) {
            console.error(e.message);
            res.status(500).send("Server Error");
        }
    }
);


module.exports = router;